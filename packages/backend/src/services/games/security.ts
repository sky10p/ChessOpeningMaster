import { createCipheriv, createDecipheriv, createHash, createSecretKey, randomBytes } from "crypto";

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

const toHex = (bytes: Uint8Array): string => Buffer.from(bytes).toString("hex");

const fromHex = (hex: string): Uint8Array => Uint8Array.from(Buffer.from(hex, "hex"));

const ENCRYPTION_KEY = createSecretKey(fromHex(createHash("sha256").update(ENCRYPTION_SECRET).digest("hex")));

export const encryptSecret = (value: string): string => {
  const iv = fromHex(randomBytes(12).toString("hex"));
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encryptedHex = `${cipher.update(value, "utf8", "hex")}${cipher.final("hex")}`;
  const authTag = Uint8Array.from(cipher.getAuthTag());
  return `${toHex(iv)}:${toHex(authTag)}:${encryptedHex}`;
};

export const decryptSecret = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const [ivHex, tagHex, encryptedHex] = value.split(":");
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Invalid encrypted secret format");
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, fromHex(ivHex));
    decipher.setAuthTag(fromHex(tagHex));
    const decryptedUtf8 = `${decipher.update(encryptedHex, "hex", "utf8")}${decipher.final("utf8")}`;
    return decryptedUtf8;
  } catch {
    throw new Error("Failed to decrypt secret");
  }
};
