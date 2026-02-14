import * as mongo from "../../db/mongo";
import { pbkdf2Sync } from "crypto";
import {
  createUser,
  ensureDefaultUserAndMigrateData,
  getAuthTokenTtlMs,
  getUserByToken,
  loginDefaultUserWithoutPassword,
  loginUser,
  revokeToken,
} from "../authService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

type MockCollection = {
  findOne: jest.Mock;
  insertOne: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
  updateMany: jest.Mock;
};

type MockDb = {
  collection: jest.Mock;
};

const objectId = (value: string) => ({
  toString: () => value,
});

const createMockCollection = (): MockCollection => ({
  findOne: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  updateMany: jest.fn(),
});

describe("authService", () => {
  let usersCollection: MockCollection;
  let authTokensCollection: MockCollection;
  let repertoiresCollection: MockCollection;
  let studiesCollection: MockCollection;
  let positionsCollection: MockCollection;
  let variantsInfoCollection: MockCollection;
  let mockDb: MockDb;

  beforeEach(() => {
    usersCollection = createMockCollection();
    authTokensCollection = createMockCollection();
    repertoiresCollection = createMockCollection();
    studiesCollection = createMockCollection();
    positionsCollection = createMockCollection();
    variantsInfoCollection = createMockCollection();

    mockDb = {
      collection: jest.fn((name: string) => {
        if (name === "users") {
          return usersCollection;
        }
        if (name === "authTokens") {
          return authTokensCollection;
        }
        if (name === "repertoires") {
          return repertoiresCollection;
        }
        if (name === "studies") {
          return studiesCollection;
        }
        if (name === "positions") {
          return positionsCollection;
        }
        if (name === "variantsInfo") {
          return variantsInfoCollection;
        }
        throw new Error(`Unexpected collection ${name}`);
      }),
    };

    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);
    jest.clearAllMocks();
  });

  it("creates a new user with password hash and salt", async () => {
    usersCollection.findOne.mockResolvedValue(null);
    usersCollection.insertOne.mockResolvedValue({ insertedId: objectId("user-1") });

    const userId = await createUser("alice", "StrongPass1!");

    expect(userId).toBe("user-1");
    expect(usersCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "alice",
        passwordHash: expect.any(String),
        passwordSalt: expect.any(String),
        createdAt: expect.any(Date),
      })
    );
    const insertedUser = usersCollection.insertOne.mock.calls[0][0];
    expect(insertedUser.passwordHash).not.toBe("StrongPass1!");
    expect(insertedUser.passwordSalt).toHaveLength(32);
  });

  it("throws USER_ALREADY_EXISTS when username already exists", async () => {
    usersCollection.findOne.mockResolvedValue({ _id: objectId("existing-user") });

    await expect(createUser("alice", "StrongPass1!")).rejects.toThrow("USER_ALREADY_EXISTS");
  });

  it("logs in user with valid credentials and creates auth token", async () => {
    const passwordSalt = "0123456789abcdef0123456789abcdef";
    const passwordHash = pbkdf2Sync("password", passwordSalt, 10000, 64, "sha512").toString("hex");
    usersCollection.findOne.mockResolvedValue({
      _id: objectId("user-42"),
      username: "alice",
      passwordSalt,
      passwordHash,
    });
    authTokensCollection.insertOne.mockResolvedValue({ insertedId: objectId("token-1") });

    const result = await loginUser("alice", "password");

    expect(result).toEqual({ token: expect.stringMatching(/^[a-f0-9]{96}$/), userId: "user-42" });
    expect(authTokensCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-42",
        token: expect.any(String),
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      })
    );
  });

  it("returns null for wrong password", async () => {
    const passwordSalt = "0123456789abcdef0123456789abcdef";
    const passwordHash = pbkdf2Sync("password", passwordSalt, 10000, 64, "sha512").toString("hex");
    usersCollection.findOne.mockResolvedValue({
      _id: objectId("user-42"),
      username: "alice",
      passwordSalt,
      passwordHash,
    });

    const result = await loginUser("alice", "wrong-password");

    expect(result).toBeNull();
    expect(authTokensCollection.insertOne).not.toHaveBeenCalled();
  });

  it("returns null for unknown user", async () => {
    usersCollection.findOne.mockResolvedValue(null);

    const result = await loginUser("nobody", "whatever");

    expect(result).toBeNull();
  });

  it("resolves user by valid token", async () => {
    authTokensCollection.findOne.mockResolvedValue({ userId: "user-1" });

    const userId = await getUserByToken("token-123");

    expect(userId).toBe("user-1");
    expect(authTokensCollection.deleteMany).not.toHaveBeenCalled();
  });

  it("returns null for invalid token and runs stale token cleanup for that token", async () => {
    authTokensCollection.findOne.mockResolvedValue(null);
    authTokensCollection.deleteMany.mockResolvedValue({ deletedCount: 1 });

    const userId = await getUserByToken("token-123");

    expect(userId).toBeNull();
    expect(authTokensCollection.deleteMany).toHaveBeenCalledWith({
      $or: [{ token: "token-123", expiresAt: { $lte: expect.any(Date) } }, { token: "token-123", expiresAt: { $exists: false } }],
    });
  });

  it("revokes token", async () => {
    authTokensCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await revokeToken("token-abc");

    expect(authTokensCollection.deleteOne).toHaveBeenCalledWith({ token: "token-abc" });
  });

  it("logs in default user without password by creating auth token", async () => {
    usersCollection.findOne.mockResolvedValue({ _id: objectId("default-user") });
    authTokensCollection.insertOne.mockResolvedValue({ insertedId: objectId("token-1") });

    const result = await loginDefaultUserWithoutPassword();

    expect(result).toEqual({ token: expect.stringMatching(/^[a-f0-9]{96}$/), userId: "default-user" });
  });

  it("creates default user and migrates legacy data", async () => {
    usersCollection.findOne.mockResolvedValueOnce(null);
    usersCollection.insertOne.mockResolvedValue({ insertedId: objectId("default-user") });
    repertoiresCollection.updateMany.mockResolvedValue({ modifiedCount: 1 });
    studiesCollection.updateMany.mockResolvedValue({ modifiedCount: 1 });
    positionsCollection.updateMany.mockResolvedValue({ modifiedCount: 1 });
    variantsInfoCollection.updateMany.mockResolvedValue({ modifiedCount: 1 });

    const defaultUserId = await ensureDefaultUserAndMigrateData();

    expect(defaultUserId).toBe("default-user");
    expect(usersCollection.insertOne).toHaveBeenCalledTimes(1);
    expect(repertoiresCollection.updateMany).toHaveBeenCalledWith(
      { userId: { $exists: false } },
      { $set: { userId: "default-user" } }
    );
    expect(studiesCollection.updateMany).toHaveBeenCalledWith(
      { userId: { $exists: false } },
      { $set: { userId: "default-user" } }
    );
    expect(positionsCollection.updateMany).toHaveBeenCalledWith(
      { userId: { $exists: false } },
      { $set: { userId: "default-user" } }
    );
    expect(variantsInfoCollection.updateMany).toHaveBeenCalledWith(
      { userId: { $exists: false } },
      { $set: { userId: "default-user" } }
    );
  });

  it("returns positive auth token ttl in milliseconds", () => {
    expect(getAuthTokenTtlMs()).toBeGreaterThan(0);
  });
});