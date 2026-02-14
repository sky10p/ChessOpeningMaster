import { randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";
import { getDB } from "../db/mongo";

const DEFAULT_USERNAME = process.env.DEFAULT_USER_USERNAME || "default";
const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || randomBytes(32).toString("hex");
const AUTH_TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS || "2592000");

function getAuthTokenTtlSeconds(): number {
  if (!Number.isFinite(AUTH_TOKEN_TTL_SECONDS) || AUTH_TOKEN_TTL_SECONDS <= 0) {
    return 2592000;
  }
  return Math.floor(AUTH_TOKEN_TTL_SECONDS);
}

function getTokenExpirationDate(): Date {
  return new Date(Date.now() + getAuthTokenTtlSeconds() * 1000);
}

export function getAuthTokenTtlMs(): number {
  return getAuthTokenTtlSeconds() * 1000;
}

export function isAuthEnabled(): boolean {
  return process.env.ENABLE_AUTH === "true";
}

export function isDefaultUserAccessAllowed(): boolean {
  return process.env.ALLOW_DEFAULT_USER === "true";
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function comparePasswordHashes(storedHash: string, incomingHash: string): boolean {
  const storedBuffer = Buffer.from(storedHash, "hex");
  const incomingBuffer = Buffer.from(incomingHash, "hex");
  if (storedBuffer.length !== incomingBuffer.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer as NodeJS.ArrayBufferView, incomingBuffer as NodeJS.ArrayBufferView);
}

function createPasswordSalt(): string {
  return randomBytes(16).toString("hex");
}

export async function createUser(username: string, password: string): Promise<string> {
  const db = getDB();
  const existingUser = await db.collection("users").findOne({ username });
  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordSalt = createPasswordSalt();
  const passwordHash = hashPassword(password, passwordSalt);
  const result = await db.collection("users").insertOne({
    username,
    passwordHash,
    passwordSalt,
    createdAt: new Date(),
  });

  return result.insertedId.toString();
}

export async function loginUser(username: string, password: string): Promise<{ token: string; userId: string } | null> {
  const db = getDB();
  const user = await db.collection("users").findOne({ username });
  if (!user) {
    return null;
  }

  const incomingHash = hashPassword(password, user.passwordSalt);
  if (!comparePasswordHashes(user.passwordHash, incomingHash)) {
    return null;
  }

  return createAuthToken(user._id.toString());
}

export async function loginDefaultUserWithoutPassword(): Promise<{ token: string; userId: string }> {
  const userId = await getDefaultUserId();
  return createAuthToken(userId);
}

async function createAuthToken(userId: string): Promise<{ token: string; userId: string }> {
  const db = getDB();
  const token = randomBytes(48).toString("hex");
  const createdAt = new Date();
  const expiresAt = getTokenExpirationDate();
  await db.collection("authTokens").insertOne({
    userId,
    token,
    createdAt,
    expiresAt,
  });

  return { token, userId };
}

export async function getUserByToken(token: string): Promise<string | null> {
  const db = getDB();
  const now = new Date();
  const authToken = await db.collection("authTokens").findOne({
    token,
    expiresAt: { $gt: now },
  });

  if (!authToken) {
    await db.collection("authTokens").deleteMany({
      $or: [{ token, expiresAt: { $lte: now } }, { token, expiresAt: { $exists: false } }],
    });
  }

  return authToken ? authToken.userId : null;
}

export async function revokeToken(token: string): Promise<void> {
  const db = getDB();
  await db.collection("authTokens").deleteOne({ token });
}

async function hasLegacyDocumentsWithoutUserId(): Promise<boolean> {
  const db = getDB();
  const filter = { userId: { $exists: false } };

  const [repertoireDoc, studyDoc, positionDoc, variantInfoDoc] = await Promise.all([
    db.collection("repertoires").findOne(filter, { projection: { _id: 1 } }),
    db.collection("studies").findOne(filter, { projection: { _id: 1 } }),
    db.collection("positions").findOne(filter, { projection: { _id: 1 } }),
    db.collection("variantsInfo").findOne(filter, { projection: { _id: 1 } }),
  ]);

  return Boolean(repertoireDoc || studyDoc || positionDoc || variantInfoDoc);
}

export async function ensureDefaultUserAndMigrateData(): Promise<string> {
  const db = getDB();
  let defaultUser = await db.collection("users").findOne({ username: DEFAULT_USERNAME });

  if (!defaultUser) {
    const passwordSalt = createPasswordSalt();
    const passwordHash = hashPassword(DEFAULT_PASSWORD, passwordSalt);
    const result = await db.collection("users").insertOne({
      username: DEFAULT_USERNAME,
      passwordHash,
      passwordSalt,
      createdAt: new Date(),
    });
    defaultUser = { _id: result.insertedId };
  }

  const defaultUserId = defaultUser._id.toString();

  const hasLegacyDocuments = await hasLegacyDocumentsWithoutUserId();
  if (!hasLegacyDocuments) {
    return defaultUserId;
  }

  await Promise.all([
    db.collection("repertoires").updateMany({ userId: { $exists: false } }, { $set: { userId: defaultUserId } }),
    db.collection("studies").updateMany({ userId: { $exists: false } }, { $set: { userId: defaultUserId } }),
    db.collection("positions").updateMany({ userId: { $exists: false } }, { $set: { userId: defaultUserId } }),
    db.collection("variantsInfo").updateMany({ userId: { $exists: false } }, { $set: { userId: defaultUserId } }),
  ]);

  return defaultUserId;
}

export async function getDefaultUserId(): Promise<string> {
  const db = getDB();
  const defaultUser = await db.collection("users").findOne({ username: DEFAULT_USERNAME });
  if (!defaultUser) {
    return ensureDefaultUserAndMigrateData();
  }
  return defaultUser._id.toString();
}

export function getDefaultUsername(): string {
  return DEFAULT_USERNAME;
}
