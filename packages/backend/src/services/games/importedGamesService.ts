import { ObjectId } from "mongodb";
import { ImportedGame } from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { ImportedGameDocument, LinkedGameAccountDocument } from "../../models/GameImport";
import type { ImportedGamesFilters } from "./gameImportFilters";
import { ImportBatchCache, RepertoireMetadata } from "./gameImportTypes";
import { buildRepertoireMetadataById } from "./repertoireMetadataService";
import { normalizeImportedOpeningData } from "./openingDetectionService";
import { buildImportedGamesFilter } from "./gameStatsService";
import { toTimeControlBucket } from "./gameTimeControlService";
import { detectOpening } from "./pgnProcessing";
import { buildOpeningMapping } from "./openingMappingService";

const appendAndConstraint = (baseFilter: Record<string, unknown>, constraint: Record<string, unknown>): Record<string, unknown> => ({
  ...baseFilter,
  $and: [
    ...(Array.isArray(baseFilter.$and) ? baseFilter.$and : []),
    constraint,
  ],
});

const buildLegacyTimeControlBucketConstraint = (): Record<string, unknown> => ({
  $or: [
    { timeControlBucket: { $exists: false } },
    { timeControlBucket: null },
  ],
});

const buildTimeControlBucketPreFilterConstraint = (timeControlBucket: ImportedGamesFilters["timeControlBucket"]): Record<string, unknown> => ({
  $or: [
    { timeControlBucket },
    { timeControlBucket: { $exists: false } },
    { timeControlBucket: null },
  ],
});

const buildDerivedTimeControlBucketExpression = () => {
  const normalizedTimeControl = {
    $toLower: {
      $trim: {
        input: { $ifNull: ["$timeControl", ""] },
      },
    },
  };
  const rawPart = {
    $arrayElemAt: [{ $split: [{ $ifNull: ["$timeControl", ""] }, "+"] }, 0],
  };
  const rawNumericSeconds = {
    $convert: {
      input: rawPart,
      to: "double",
      onError: null,
      onNull: null,
    },
  };
  const denominatorPart = {
    $arrayElemAt: [{ $split: [rawPart, "/"] }, 1],
  };
  const denominatorSeconds = {
    $convert: {
      input: denominatorPart,
      to: "double",
      onError: null,
      onNull: null,
    },
  };

  return {
    $ifNull: [
      "$timeControlBucket",
      {
        $switch: {
          branches: [
            {
              case: { $regexMatch: { input: normalizedTimeControl, regex: "bullet" } },
              then: "bullet",
            },
            {
              case: { $regexMatch: { input: normalizedTimeControl, regex: "blitz" } },
              then: "blitz",
            },
            {
              case: { $regexMatch: { input: normalizedTimeControl, regex: "rapid" } },
              then: "rapid",
            },
            {
              case: { $regexMatch: { input: normalizedTimeControl, regex: "classical|daily|correspondence" } },
              then: "classical",
            },
            {
              case: {
                $and: [
                  { $ne: [rawNumericSeconds, null] },
                  { $lt: [rawNumericSeconds, 180] },
                ],
              },
              then: "bullet",
            },
            {
              case: {
                $and: [
                  { $ne: [rawNumericSeconds, null] },
                  { $lt: [rawNumericSeconds, 600] },
                ],
              },
              then: "blitz",
            },
            {
              case: {
                $and: [
                  { $ne: [rawNumericSeconds, null] },
                  { $lt: [rawNumericSeconds, 1800] },
                ],
              },
              then: "rapid",
            },
            {
              case: { $ne: [rawNumericSeconds, null] },
              then: "classical",
            },
            {
              case: {
                $and: [
                  {
                    $regexMatch: {
                      input: rawPart,
                      regex: "^[^/]+/[^/]+$",
                    },
                  },
                  { $ne: [denominatorSeconds, null] },
                  { $gt: [denominatorSeconds, 0] },
                  { $gte: [denominatorSeconds, 1800] },
                ],
              },
              then: "classical",
            },
            {
              case: {
                $and: [
                  {
                    $regexMatch: {
                      input: rawPart,
                      regex: "^[^/]+/[^/]+$",
                    },
                  },
                  { $ne: [denominatorSeconds, null] },
                  { $gt: [denominatorSeconds, 0] },
                  { $gte: [denominatorSeconds, 600] },
                ],
              },
              then: "rapid",
            },
            {
              case: {
                $and: [
                  {
                    $regexMatch: {
                      input: rawPart,
                      regex: "^[^/]+/[^/]+$",
                    },
                  },
                  { $ne: [denominatorSeconds, null] },
                  { $gt: [denominatorSeconds, 0] },
                  { $gte: [denominatorSeconds, 180] },
                ],
              },
              then: "blitz",
            },
            {
              case: {
                $and: [
                  {
                    $regexMatch: {
                      input: rawPart,
                      regex: "^[^/]+/[^/]+$",
                    },
                  },
                  { $ne: [denominatorSeconds, null] },
                  { $gt: [denominatorSeconds, 0] },
                ],
              },
              then: "bullet",
            },
          ],
          default: null,
        },
      },
    ],
  };
};

const mapImportedGame = (
  doc: ImportedGameDocument & { _id: ObjectId },
  repertoireMetadataById: Map<string, RepertoireMetadata>
): ImportedGame => {
  const normalized = normalizeImportedOpeningData(doc, repertoireMetadataById);
  return {
    id: doc._id.toString(),
    source: doc.source,
    providerGameId: doc.providerGameId,
    white: doc.white,
    black: doc.black,
    whiteRating: doc.whiteRating,
    blackRating: doc.blackRating,
    result: doc.result,
    timeControl: doc.timeControl,
    timeControlBucket: doc.timeControlBucket || toTimeControlBucket(doc.timeControl),
    rated: doc.rated,
    playedAt: doc.playedAt?.toISOString(),
    pgn: doc.pgn,
    movesSan: doc.movesSan,
    orientation: doc.orientation,
    tournamentGroup: doc.tournamentGroup,
    tags: doc.tags,
    openingDetection: normalized.openingDetection,
    openingMapping: normalized.openingMapping,
  };
};

export async function listImportedGamesForUser(userId: string, limit = 100, filters: ImportedGamesFilters = {}): Promise<ImportedGame[]> {
  const db = getDB();
  const docs = filters.timeControlBucket
    ? await db.collection<ImportedGameDocument>("importedGames")
      .aggregate<ImportedGameDocument>([
        {
          $match: appendAndConstraint(
            buildImportedGamesFilter(userId, {
            ...filters,
            timeControlBucket: undefined,
            }),
            buildTimeControlBucketPreFilterConstraint(filters.timeControlBucket)
          ),
        },
        {
          $addFields: {
            derivedTimeControlBucket: buildDerivedTimeControlBucketExpression(),
          },
        },
        {
          $match: {
            derivedTimeControlBucket: filters.timeControlBucket,
          },
        },
        {
          $sort: { playedAt: -1, createdAt: -1 },
        },
        {
          $limit: limit,
        },
      ])
      .toArray()
    : await db.collection<ImportedGameDocument>("importedGames")
      .find(buildImportedGamesFilter(userId, filters))
      .sort({ playedAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();
  const repertoires = await db.collection("repertoires").find({ userId }).project({ _id: 1, name: 1, moveNodes: 1, orientation: 1 }).toArray();
  const repertoireMetadataById = buildRepertoireMetadataById(
    repertoires.map((repertoire) => ({
      _id: repertoire._id,
      name: repertoire.name,
      moveNodes: repertoire.moveNodes,
      orientation: repertoire.orientation,
    }))
  );
  return docs.map((doc) => mapImportedGame({ ...doc, _id: doc._id as unknown as ObjectId }, repertoireMetadataById));
}

export async function deleteImportedGameForUser(userId: string, gameId: string): Promise<boolean> {
  if (!ObjectId.isValid(gameId)) {
    return false;
  }
  const db = getDB();
  const result = await db.collection<ImportedGameDocument>("importedGames").deleteOne({
    userId,
    _id: new ObjectId(gameId),
  });
  return result.deletedCount === 1;
}

export async function clearImportedGamesForUser(userId: string, filters: ImportedGamesFilters = {}): Promise<number> {
  const db = getDB();
  const shouldResetSyncCursor = (
    !filters.color &&
    !filters.dateFrom &&
    !filters.dateTo &&
    !filters.timeControlBucket &&
    (!filters.openingQuery || filters.openingQuery.trim().length === 0) &&
    (!filters.mapped || filters.mapped === "all")
  );
  const resetLinkedAccountsIfNeeded = async () => {
    if (!shouldResetSyncCursor || filters.source === "manual") {
      return;
    }
    await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").updateMany(
      {
        userId,
        ...(filters.source ? { provider: filters.source } : {}),
      },
      {
        $set: { status: "idle" },
        $unset: {
          lastSyncAt: "",
          lastSyncFeedback: "",
          lastSyncStartedAt: "",
          lastSyncFinishedAt: "",
          lastError: "",
        },
      }
    );
  };

  if (filters.timeControlBucket) {
    const baseFilter = buildImportedGamesFilter(userId, { ...filters, timeControlBucket: undefined });
    const persistedDeleteResult = await db.collection<ImportedGameDocument>("importedGames").deleteMany({
      ...baseFilter,
      timeControlBucket: filters.timeControlBucket,
    });
    const legacyIds = await db.collection<ImportedGameDocument>("importedGames")
      .aggregate<{ _id?: ObjectId }>([
        {
          $match: appendAndConstraint(baseFilter, buildLegacyTimeControlBucketConstraint()),
        },
        {
          $addFields: {
            derivedTimeControlBucket: buildDerivedTimeControlBucketExpression(),
          },
        },
        {
          $match: {
            derivedTimeControlBucket: filters.timeControlBucket,
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ])
      .toArray();
    const legacyIdsToDelete = legacyIds
      .map((doc) => doc._id)
      .filter((id): id is ObjectId => Boolean(id));
    let legacyDeletedCount = 0;
    if (legacyIdsToDelete.length > 0) {
      const legacyDeleteResult = await db.collection<ImportedGameDocument>("importedGames").deleteMany({
        userId,
        _id: { $in: legacyIdsToDelete },
      });
      legacyDeletedCount = legacyDeleteResult.deletedCount || 0;
    }
    const totalDeletedCount = (persistedDeleteResult.deletedCount || 0) + legacyDeletedCount;
    if (totalDeletedCount > 0) {
      await resetLinkedAccountsIfNeeded();
    }
    return totalDeletedCount;
  }
  const result = await db.collection<ImportedGameDocument>("importedGames").deleteMany(buildImportedGamesFilter(userId, filters));
  if ((result.deletedCount || 0) > 0) {
    await resetLinkedAccountsIfNeeded();
  }
  return result.deletedCount || 0;
}

export async function rematchImportedGamesForUser(
  userId: string,
  filters: ImportedGamesFilters = {}
): Promise<{ scannedCount: number; updatedCount: number }> {
  const db = getDB();
  const gamesCollection = db.collection<ImportedGameDocument>("importedGames");
  const query = buildImportedGamesFilter(userId, filters);
  const docs = await gamesCollection.find(query).toArray();
  if (docs.length === 0) {
    return { scannedCount: 0, updatedCount: 0 };
  }

  const importBatchCache: ImportBatchCache = {
    repertoireMetadataByScope: new Map(),
  };

  const operations: Array<{ updateOne: { filter: Record<string, unknown>; update: Record<string, unknown> } }> = [];

  for (const doc of docs) {
    const openingDetection = detectOpening({}, doc.movesSan || []);
    const openingMapping = await buildOpeningMapping(
      userId,
      doc.orientation,
      openingDetection.openingName || doc.openingDetection?.openingName,
      openingDetection.eco || doc.openingDetection?.eco,
      openingDetection.lineMovesSan,
      doc.tags,
      importBatchCache
    );
    const resolvedOpeningName = openingDetection.openingName || openingMapping.variantName || openingMapping.repertoireName;
    const nextOpeningDetection = {
      ...openingDetection,
      ...(resolvedOpeningName ? { openingName: resolvedOpeningName } : {}),
    };
    const nextTimeControlBucket = doc.timeControlBucket || toTimeControlBucket(doc.timeControl);

    const openingDetectionChanged = JSON.stringify(doc.openingDetection || {}) !== JSON.stringify(nextOpeningDetection);
    const openingMappingChanged = JSON.stringify(doc.openingMapping || {}) !== JSON.stringify(openingMapping);
    const timeControlChanged = (doc.timeControlBucket || null) !== (nextTimeControlBucket || null);

    if (!openingDetectionChanged && !openingMappingChanged && !timeControlChanged) {
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: doc._id, userId },
        update: {
          $set: {
            openingDetection: nextOpeningDetection,
            openingMapping,
            ...(nextTimeControlBucket ? { timeControlBucket: nextTimeControlBucket } : {}),
          },
        },
      },
    });
  }

  if (operations.length > 0) {
    await gamesCollection.bulkWrite(operations, { ordered: false });
  }

  return {
    scannedCount: docs.length,
    updatedCount: operations.length,
  };
}
