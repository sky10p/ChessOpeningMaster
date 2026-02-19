import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

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

const buildKey = (): Buffer => createHash("sha256").update(ENCRYPTION_SECRET).digest();

export const encryptSecret = (value: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", buildKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptSecret = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const [ivHex, tagHex, encryptedHex] = value.split(":");
  if (!ivHex || !tagHex || !encryptedHex) {
    return undefined;
  }
  const decipher = createDecipheriv("aes-256-gcm", buildKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};
