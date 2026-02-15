import { CreateIndexesOptions, Db, IndexSpecification, ObjectId } from "mongodb";

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

const normalizeIndexKey = (key: Record<string, unknown> | undefined): string => {
  if (!key) {
    return "";
  }
  return JSON.stringify(
    Object.keys(key)
      .sort()
      .reduce<Record<string, unknown>>((result, indexKey) => {
        result[indexKey] = key[indexKey];
        return result;
      }, {})
  );
};

const toObjectId = (value: unknown): ObjectId | null => {
  if (value instanceof ObjectId) {
    return value;
  }
  if (typeof value === "string" && ObjectId.isValid(value)) {
    return new ObjectId(value);
  }
  return null;
};

const getDistinctObjectIds = (values: unknown[]): ObjectId[] => {
  const seen = new Set<string>();
  const result: ObjectId[] = [];
  values.forEach((value) => {
    const objectId = toObjectId(value);
    if (!objectId) {
      return;
    }
    const key = objectId.toHexString();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(objectId);
  });
  return result;
};

const removeDuplicateVariantInfoRecords = async (db: Db): Promise<void> => {
  const duplicateGroups = await db
    .collection("variantsInfo")
    .aggregate<{
      _id: { userId: string; repertoireId: string; variantName: string };
      ids: unknown[];
      keepId: unknown;
      count: number;
    }>([
      {
        $group: {
          _id: {
            userId: "$userId",
            repertoireId: "$repertoireId",
            variantName: "$variantName",
          },
          ids: { $push: "$_id" },
          keepId: { $max: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ])
    .toArray();

  for (const group of duplicateGroups) {
    try {
      const keepId = toObjectId(group.keepId);
      const ids = getDistinctObjectIds(group.ids);
      const duplicateIds = keepId
        ? ids.filter((id) => id.toHexString() !== keepId.toHexString())
        : ids;
      if (duplicateIds.length === 0) {
        continue;
      }
      const deleteResult = await db
        .collection("variantsInfo")
        .deleteMany({ _id: { $in: duplicateIds } });
      console.info("Removed duplicate variantsInfo records", {
        userId: group._id.userId,
        repertoireId: group._id.repertoireId,
        variantName: group._id.variantName,
        deletedCount: deleteResult.deletedCount,
      });
    } catch (error) {
      console.error("Failed to remove duplicate variantsInfo records", {
        userId: group._id.userId,
        repertoireId: group._id.repertoireId,
        variantName: group._id.variantName,
        error,
      });
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

  const variantsInfoCollection = db.collection("variantsInfo");
  const existingVariantIndexes = await variantsInfoCollection.indexes();
  const variantNaturalKey = normalizeIndexKey({ userId: 1, repertoireId: 1, variantName: 1 });
  const legacyNaturalKeyIndex = existingVariantIndexes.find(
    (index) => normalizeIndexKey(index.key as Record<string, unknown> | undefined) === variantNaturalKey
  );
  if (legacyNaturalKeyIndex?.name && !legacyNaturalKeyIndex.unique) {
    await variantsInfoCollection.dropIndex(legacyNaturalKeyIndex.name);
  }

  await removeDuplicateVariantInfoRecords(db);

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
    createIndexSafely(db, "variantsInfo", { userId: 1, repertoireId: 1, variantName: 1 }, { unique: true }),
    createIndexSafely(db, "variantsInfo", { userId: 1, dueAt: 1 }),
    createIndexSafely(db, "variantsInfo", { userId: 1, lastReviewedDayKey: 1 }),
    createIndexSafely(db, "variantReviewHistory", { userId: 1, reviewedAt: -1 }),
    createIndexSafely(db, "variantReviewHistory", { userId: 1, reviewedDayKey: 1 }),
    createIndexSafely(db, "variantReviewHistory", { userId: 1, openingName: 1, orientation: 1 }),
  ]);
}
