import { createCipheriv, createDecipheriv, createHash, createSecretKey, randomBytes, scryptSync } from "crypto";

const getEncryptionSecret = (): string => {
  const configuredSecret = process.env.GAME_PROVIDER_TOKEN_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("GAME_PROVIDER_TOKEN_SECRET is required in production");
  }
  return "development-game-provider-secret";
};

const ENCRYPTION_SECRET = getEncryptionSecret();

const toHex = (bytes: Uint8Array): string =>
  Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("hex");

const toBytes = (bytes: Buffer): Uint8Array =>
  new Uint8Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));

const fromHex = (hex: string): Uint8Array => toBytes(Buffer.from(hex, "hex"));

const randomBytesArray = (size: number): Uint8Array => toBytes(randomBytes(size));

const ENCRYPTION_SCHEME = "s1";
const ENCRYPTION_KEY_LENGTH = 32;
const ENCRYPTION_SALT_BYTES = 16;

const deriveEncryptionKey = (secret: string, saltHex: string) =>
  createSecretKey(toBytes(scryptSync(secret, fromHex(saltHex), ENCRYPTION_KEY_LENGTH)));

const LEGACY_ENCRYPTION_KEY = createSecretKey(fromHex(createHash("sha256").update(ENCRYPTION_SECRET).digest("hex")));

export const encryptSecret = (value: string): string => {
  const saltHex = toHex(randomBytesArray(ENCRYPTION_SALT_BYTES));
  const encryptionKey = deriveEncryptionKey(ENCRYPTION_SECRET, saltHex);
  const iv = randomBytesArray(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encryptedHex = `${cipher.update(value, "utf8", "hex")}${cipher.final("hex")}`;
  const authTag = toBytes(cipher.getAuthTag());
  return `${ENCRYPTION_SCHEME}:${saltHex}:${toHex(iv)}:${toHex(authTag)}:${encryptedHex}`;
};

export const decryptSecret = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const decryptWithKey = (encryptedValue: string, key: ReturnType<typeof createSecretKey>): string => {
    const [ivHex, tagHex, encryptedHex] = encryptedValue.split(":");
    if (!ivHex || !tagHex || !encryptedHex) {
      throw new Error("Invalid encrypted secret format");
    }
    const decipher = createDecipheriv("aes-256-gcm", key, fromHex(ivHex));
    decipher.setAuthTag(fromHex(tagHex));
    return `${decipher.update(encryptedHex, "hex", "utf8")}${decipher.final("utf8")}`;
  };

  const [scheme, saltHex, ivHex, tagHex, encryptedHex] = value.split(":");
  try {
    if (scheme === ENCRYPTION_SCHEME && saltHex && ivHex && tagHex && encryptedHex) {
      const key = deriveEncryptionKey(ENCRYPTION_SECRET, saltHex);
      return decryptWithKey(`${ivHex}:${tagHex}:${encryptedHex}`, key);
    }

    return decryptWithKey(value, LEGACY_ENCRYPTION_KEY);
  } catch {
    throw new Error("Failed to decrypt secret");
  }
};
