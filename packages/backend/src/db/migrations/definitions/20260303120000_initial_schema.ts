import { CreateIndexesOptions, Db, Document, IndexSpecification, MongoServerError } from "mongodb";
import { MigrationDefinition } from "../types";

type BaselineIndex = {
  collectionName: string;
  keys: IndexSpecification;
  options?: CreateIndexesOptions;
};

type ExistingIndex = {
  name?: string;
  key?: Document;
  unique?: boolean;
  expireAfterSeconds?: number;
};

const baselineIndexes: BaselineIndex[] = [
  { collectionName: "positions", keys: { fen: 1, userId: 1 }, options: { name: "fen_1_userId_1", unique: true } },
  { collectionName: "users", keys: { username: 1 }, options: { name: "username_1", unique: true } },
  { collectionName: "authTokens", keys: { token: 1 }, options: { name: "token_1", unique: true } },
  { collectionName: "authTokens", keys: { userId: 1 }, options: { name: "userId_1" } },
  { collectionName: "authTokens", keys: { expiresAt: 1 }, options: { name: "expiresAt_1", expireAfterSeconds: 0 } },
  { collectionName: "repertoires", keys: { userId: 1 }, options: { name: "userId_1" } },
  { collectionName: "studies", keys: { userId: 1 }, options: { name: "userId_1" } },
  { collectionName: "positions", keys: { userId: 1 }, options: { name: "userId_1" } },
  { collectionName: "variantsInfo", keys: { userId: 1 }, options: { name: "userId_1" } },
  { collectionName: "variantsInfo", keys: { repertoireId: 1, userId: 1 }, options: { name: "repertoireId_1_userId_1" } },
  {
    collectionName: "variantsInfo",
    keys: { userId: 1, repertoireId: 1, variantName: 1 },
    options: { name: "userId_1_repertoireId_1_variantName_1", unique: true },
  },
  { collectionName: "variantsInfo", keys: { userId: 1, dueAt: 1 }, options: { name: "userId_1_dueAt_1" } },
  { collectionName: "variantsInfo", keys: { userId: 1, lastReviewedDayKey: 1 }, options: { name: "userId_1_lastReviewedDayKey_1" } },
  { collectionName: "variantReviewHistory", keys: { userId: 1, reviewedAt: -1 }, options: { name: "userId_1_reviewedAt_-1" } },
  { collectionName: "variantReviewHistory", keys: { userId: 1, reviewedDayKey: 1 }, options: { name: "userId_1_reviewedDayKey_1" } },
  {
    collectionName: "variantReviewHistory",
    keys: { userId: 1, openingName: 1, orientation: 1 },
    options: { name: "userId_1_openingName_1_orientation_1" },
  },
  {
    collectionName: "variantMistakes",
    keys: { userId: 1, repertoireId: 1, variantName: 1, mistakeKey: 1 },
    options: { name: "userId_1_repertoireId_1_variantName_1_mistakeKey_1", unique: true },
  },
  { collectionName: "variantMistakes", keys: { userId: 1, dueAt: 1 }, options: { name: "userId_1_dueAt_1" } },
  {
    collectionName: "variantMistakes",
    keys: { userId: 1, openingName: 1, orientation: 1, dueAt: 1 },
    options: { name: "userId_1_openingName_1_orientation_1_dueAt_1" },
  },
  {
    collectionName: "variantMistakes",
    keys: { userId: 1, repertoireId: 1, openingName: 1, dueAt: 1 },
    options: { name: "userId_1_repertoireId_1_openingName_1_dueAt_1" },
  },
  {
    collectionName: "linkedGameAccounts",
    keys: { userId: 1, provider: 1 },
    options: { name: "userId_1_provider_1", unique: true },
  },
  { collectionName: "linkedGameAccounts", keys: { status: 1, lastSyncAt: 1 }, options: { name: "status_1_lastSyncAt_1" } },
  {
    collectionName: "importedGames",
    keys: { userId: 1, dedupeKey: 1 },
    options: { name: "userId_1_dedupeKey_1", unique: true },
  },
  { collectionName: "importedGames", keys: { userId: 1, playedAt: -1 }, options: { name: "userId_1_playedAt_-1" } },
  { collectionName: "importedGames", keys: { userId: 1, source: 1, playedAt: -1 }, options: { name: "userId_1_source_1_playedAt_-1" } },
  { collectionName: "importedGames", keys: { userId: 1, orientation: 1, playedAt: -1 }, options: { name: "userId_1_orientation_1_playedAt_-1" } },
  { collectionName: "importedGames", keys: { userId: 1, rated: 1, playedAt: -1 }, options: { name: "userId_1_rated_1_playedAt_-1" } },
  {
    collectionName: "importedGames",
    keys: { userId: 1, tournamentGroup: 1, playedAt: -1 },
    options: { name: "userId_1_tournamentGroup_1_playedAt_-1" },
  },
  {
    collectionName: "importedGames",
    keys: { userId: 1, timeControlBucket: 1, playedAt: -1 },
    options: { name: "userId_1_timeControlBucket_1_playedAt_-1" },
  },
  {
    collectionName: "importedGames",
    keys: { userId: 1, "openingMapping.repertoireId": 1, playedAt: -1 },
    options: { name: "userId_1_openingMapping.repertoireId_1_playedAt_-1" },
  },
  {
    collectionName: "importedGames",
    keys: { userId: 1, "openingMapping.requiresManualReview": 1, playedAt: -1 },
    options: { name: "userId_1_openingMapping.requiresManualReview_1_playedAt_-1" },
  },
  {
    collectionName: "importedGames",
    keys: { userId: 1, source: 1, orientation: 1, timeControlBucket: 1, playedAt: -1 },
    options: { name: "userId_1_source_1_orientation_1_timeControlBucket_1_playedAt_-1" },
  },
  {
    collectionName: "importedGames",
    keys: { userId: 1, "openingDetection.lineKey": 1 },
    options: { name: "userId_1_openingDetection.lineKey_1" },
  },
  { collectionName: "trainingPlans", keys: { userId: 1, generatedAtDate: -1 }, options: { name: "userId_1_generatedAtDate_-1" } },
];

const toComparableKey = (value: IndexSpecification): string => JSON.stringify(value);

const toComparableOptions = (options?: CreateIndexesOptions): string =>
  JSON.stringify({
    unique: options?.unique === true,
    expireAfterSeconds: options?.expireAfterSeconds ?? null,
  });

const isNamespaceNotFoundError = (error: unknown): boolean =>
  error instanceof MongoServerError && (error.code === 26 || error.codeName === "NamespaceNotFound");

const listExistingIndexes = async (db: Db, collectionName: string): Promise<ExistingIndex[]> => {
  try {
    return await db.collection(collectionName).listIndexes().toArray();
  } catch (error) {
    if (isNamespaceNotFoundError(error)) {
      return [];
    }

    throw error;
  }
};

const hasMatchingIndex = (
  existingIndexes: ExistingIndex[],
  keys: IndexSpecification,
  options?: CreateIndexesOptions
): boolean => {
  const comparableKey = toComparableKey(keys);
  const comparableOptions = toComparableOptions(options);

  return existingIndexes.some(
    (index) => toComparableKey(index.key || {}) === comparableKey && toComparableOptions(index) === comparableOptions
  );
};

const hasConflictingNamedIndex = (
  existingIndexes: ExistingIndex[],
  keys: IndexSpecification,
  options?: CreateIndexesOptions
): boolean => {
  const expectedName = options?.name;
  if (!expectedName) {
    return false;
  }

  const existingIndex = existingIndexes.find((index) => index.name === expectedName);
  if (!existingIndex) {
    return false;
  }

  return (
    toComparableKey(existingIndex.key || {}) !== toComparableKey(keys) ||
    toComparableOptions(existingIndex) !== toComparableOptions(options)
  );
};

const ensureIndex = async (db: Db, definition: BaselineIndex): Promise<void> => {
  const existingIndexes = await listExistingIndexes(db, definition.collectionName);
  if (hasMatchingIndex(existingIndexes, definition.keys, definition.options)) {
    return;
  }

  if (hasConflictingNamedIndex(existingIndexes, definition.keys, definition.options)) {
    throw new Error(
      `Initial schema migration found an incompatible existing index "${definition.options?.name}" on collection "${definition.collectionName}".`
    );
  }

  await db.collection(definition.collectionName).createIndex(definition.keys, definition.options);
};

export const migration: MigrationDefinition = {
  id: "20260303120000_initial_schema",
  name: "initial schema",
  up: async (db: Db) => {
    for (const definition of baselineIndexes) {
      await ensureIndex(db, definition);
    }
  },
};
