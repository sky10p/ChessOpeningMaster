import { CreateIndexesOptions, Db, IndexSpecification } from "mongodb";

const isRecoverableIndexError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const mongoError = error as { codeName?: string; code?: number };

  return (
    mongoError.codeName === "IndexOptionsConflict" ||
    mongoError.codeName === "IndexKeySpecsConflict" ||
    mongoError.codeName === "IndexAlreadyExists" ||
    mongoError.code === 85 ||
    mongoError.code === 86
  );
};

const createIndexSafely = async (
  db: Db,
  collectionName: string,
  key: IndexSpecification,
  options?: CreateIndexesOptions
): Promise<void> => {
  try {
    await db.collection(collectionName).createIndex(key, options);
  } catch (error) {
    if (!isRecoverableIndexError(error)) {
      throw error;
    }
  }
};

export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  const positionsCollection = db.collection("positions");
  const existingPositionIndexes = await positionsCollection.indexes();
  const hasLegacyFenUniqueIndex = existingPositionIndexes.some(
    (index) => index.name === "fen_1" && index.unique === true && index.key?.fen === 1 && Object.keys(index.key || {}).length === 1
  );

  if (hasLegacyFenUniqueIndex) {
    await positionsCollection.dropIndex("fen_1");
  }

  await Promise.all([
    createIndexSafely(db, "positions", { fen: 1, userId: 1 }, { unique: true }),
    createIndexSafely(db, "users", { username: 1 }, { unique: true }),
    createIndexSafely(db, "authTokens", { token: 1 }, { unique: true }),
    createIndexSafely(db, "authTokens", { userId: 1 }),
    createIndexSafely(db, "authTokens", { expiresAt: 1 }, { expireAfterSeconds: 0 }),
    createIndexSafely(db, "repertoires", { userId: 1 }),
    createIndexSafely(db, "studies", { userId: 1 }),
    createIndexSafely(db, "positions", { userId: 1 }),
    createIndexSafely(db, "variantsInfo", { userId: 1 }),
    createIndexSafely(db, "variantsInfo", { repertoireId: 1, userId: 1 }),
  ]);
}