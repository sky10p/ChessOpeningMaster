import { GameStatsFilters, GamesStatsSummary } from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { ImportedGameDocument } from "../../models/GameImport";
import {
  buildLinesToStudy,
  buildStatsFilter,
  buildVariantTrainingKey,
} from "./gameStatsService";
import { VariantTrainingSignal } from "./gameImportTypes";

type AggregatedStatsFacets = {
  totals: Array<{
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
    mappedToRepertoireCount: number;
    needsManualReviewCount: number;
    uniqueLines: number;
    winRate: number;
  }>;
  bySource: Array<{ source: ImportedGameDocument["source"]; count: number }>;
  gamesByMonth: Array<{ month: string; games: number; wins: number; draws: number; losses: number }>;
  mappedByRepertoire: Array<{ repertoireId: string; count: number }>;
  openingPerformance: Array<{
    openingName: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    mappedGames: number;
    manualReviewGames: number;
    sampleLine: string[];
    successRate: number;
  }>;
  variantPerformance: Array<{
    variantKey: string;
    variantName: string;
    repertoireId?: string;
    repertoireName?: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    mappedGames: number;
    manualReviewGames: number;
    successRate: number;
  }>;
  topOpenings: Array<{ openingName: string; count: number }>;
};

const timeControlBucketExpr = {
  $ifNull: [
    "$timeControlBucket",
    {
      $let: {
        vars: {
          lower: { $toLower: { $ifNull: ["$timeControl", ""] } },
          base: { $arrayElemAt: [{ $split: [{ $ifNull: ["$timeControl", ""] }, "+"] }, 0] },
        },
        in: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$$lower", regex: "bullet" } }, then: "bullet" },
              { case: { $regexMatch: { input: "$$lower", regex: "blitz" } }, then: "blitz" },
              { case: { $regexMatch: { input: "$$lower", regex: "rapid" } }, then: "rapid" },
              { case: { $regexMatch: { input: "$$lower", regex: "classical|daily|correspondence" } }, then: "classical" },
              {
                case: { $regexMatch: { input: "$$base", regex: "/" } },
                then: {
                  $let: {
                    vars: {
                      denominator: {
                        $convert: {
                          input: { $arrayElemAt: [{ $split: ["$$base", "/"] }, 1] },
                          to: "int",
                          onError: null,
                          onNull: null,
                        },
                      },
                    },
                    in: {
                      $switch: {
                        branches: [
                          { case: { $gte: ["$$denominator", 1800] }, then: "classical" },
                          { case: { $gte: ["$$denominator", 600] }, then: "rapid" },
                          { case: { $gte: ["$$denominator", 180] }, then: "blitz" },
                          { case: { $gt: ["$$denominator", 0] }, then: "bullet" },
                        ],
                        default: undefined,
                      },
                    },
                  },
                },
              },
              {
                case: {
                  $ne: [
                    {
                      $convert: {
                        input: "$$base",
                        to: "int",
                        onError: null,
                        onNull: null,
                      },
                    },
                    null,
                  ],
                },
                then: {
                  $let: {
                    vars: {
                      seconds: {
                        $convert: {
                          input: "$$base",
                          to: "int",
                          onError: null,
                          onNull: null,
                        },
                      },
                    },
                    in: {
                      $switch: {
                        branches: [
                          { case: { $lt: ["$$seconds", 180] }, then: "bullet" },
                          { case: { $lt: ["$$seconds", 600] }, then: "blitz" },
                          { case: { $lt: ["$$seconds", 1800] }, then: "rapid" },
                          { case: { $gte: ["$$seconds", 1800] }, then: "classical" },
                        ],
                        default: undefined,
                      },
                    },
                  },
                },
              },
            ],
            default: undefined,
          },
        },
      },
    },
  ],
};

const resolvedOpeningNameExpr = {
  $ifNull: [
    "$openingDetection.openingName",
    {
      $ifNull: [
        "$openingMapping.variantName",
        {
          $ifNull: [
            "$openingMapping.repertoireName",
            {
              $cond: [
                { $and: [{ $ne: ["$openingDetection.eco", null] }, { $ne: ["$openingDetection.eco", ""] }] },
                { $concat: ["ECO ", "$openingDetection.eco"] },
                "Unknown",
              ],
            },
          ],
        },
      ],
    },
  ],
};

const perspectiveOutcomeExpr = {
  $switch: {
    branches: [
      {
        case: { $eq: ["$orientation", "white"] },
        then: {
          $switch: {
            branches: [
              { case: { $eq: ["$result", "1-0"] }, then: "win" },
              { case: { $eq: ["$result", "0-1"] }, then: "loss" },
              { case: { $eq: ["$result", "1/2-1/2"] }, then: "draw" },
            ],
            default: "unknown",
          },
        },
      },
      {
        case: { $eq: ["$orientation", "black"] },
        then: {
          $switch: {
            branches: [
              { case: { $eq: ["$result", "0-1"] }, then: "win" },
              { case: { $eq: ["$result", "1-0"] }, then: "loss" },
              { case: { $eq: ["$result", "1/2-1/2"] }, then: "draw" },
            ],
            default: "unknown",
          },
        },
      },
      {
        case: { $eq: ["$result", "1/2-1/2"] },
        then: "draw",
      },
    ],
    default: "unknown",
  },
};

const buildCommonComputedStages = (userId: string, filters: GameStatsFilters) => {
  const baseStages: Record<string, unknown>[] = [
    { $match: buildStatsFilter(userId, filters) },
    {
      $addFields: {
        resolvedTimeControlBucket: timeControlBucketExpr,
        resolvedOpeningName: resolvedOpeningNameExpr,
        perspectiveOutcome: perspectiveOutcomeExpr,
        resolvedLineMovesSan: { $ifNull: ["$openingDetection.lineMovesSan", []] },
      },
    },
  ];
  if (filters.timeControlBucket) {
    baseStages.push({ $match: { resolvedTimeControlBucket: filters.timeControlBucket } });
  }
  return baseStages;
};

const buildStatsFacetPipeline = (userId: string, filters: GameStatsFilters): Record<string, unknown>[] => {
  const commonStages = buildCommonComputedStages(userId, filters);
  return [
    ...commonStages,
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalGames: { $sum: 1 },
              wins: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "win"] }, 1, 0] } },
              draws: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "draw"] }, 1, 0] } },
              losses: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "loss"] }, 1, 0] } },
              mappedToRepertoireCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$openingMapping.repertoireId", null] },
                        { $ne: ["$openingMapping.repertoireId", ""] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              needsManualReviewCount: { $sum: { $cond: [{ $eq: ["$openingMapping.requiresManualReview", true] }, 1, 0] } },
              uniqueLinesSet: { $addToSet: "$openingDetection.lineKey" },
            },
          },
          {
            $project: {
              _id: 0,
              totalGames: 1,
              wins: 1,
              draws: 1,
              losses: 1,
              mappedToRepertoireCount: 1,
              needsManualReviewCount: 1,
              uniqueLines: { $size: "$uniqueLinesSet" },
              winRate: {
                $cond: [
                  { $gt: ["$totalGames", 0] },
                  { $divide: [{ $add: ["$wins", { $multiply: ["$draws", 0.5] }] }, "$totalGames"] },
                  0,
                ],
              },
            },
          },
        ],
        bySource: [
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $project: { _id: 0, source: "$_id", count: 1 } },
        ],
        gamesByMonth: [
          { $match: { playedAt: { $type: "date" } } },
          { $addFields: { month: { $dateToString: { date: "$playedAt", format: "%Y-%m" } } } },
          {
            $group: {
              _id: "$month",
              games: { $sum: 1 },
              wins: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "win"] }, 1, 0] } },
              draws: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "draw"] }, 1, 0] } },
              losses: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "loss"] }, 1, 0] } },
            },
          },
          { $project: { _id: 0, month: "$_id", games: 1, wins: 1, draws: 1, losses: 1 } },
          { $sort: { month: 1 } },
        ],
        mappedByRepertoire: [
          {
            $match: {
              "openingMapping.repertoireId": { $exists: true, $ne: null },
            },
          },
          { $group: { _id: "$openingMapping.repertoireId", count: { $sum: 1 } } },
          { $project: { _id: 0, repertoireId: "$_id", count: 1 } },
        ],
        openingPerformance: [
          {
            $group: {
              _id: "$resolvedOpeningName",
              openingName: { $first: "$resolvedOpeningName" },
              games: { $sum: 1 },
              wins: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "win"] }, 1, 0] } },
              draws: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "draw"] }, 1, 0] } },
              losses: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "loss"] }, 1, 0] } },
              mappedGames: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$openingMapping.repertoireId", null] },
                        { $ne: ["$openingMapping.repertoireId", ""] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              manualReviewGames: { $sum: { $cond: [{ $eq: ["$openingMapping.requiresManualReview", true] }, 1, 0] } },
              sampleLine: { $first: "$resolvedLineMovesSan" },
            },
          },
          {
            $project: {
              _id: 0,
              openingName: 1,
              games: 1,
              wins: 1,
              draws: 1,
              losses: 1,
              mappedGames: 1,
              manualReviewGames: 1,
              sampleLine: 1,
              successRate: {
                $cond: [
                  { $gt: [{ $add: ["$wins", "$draws", "$losses"] }, 0] },
                  {
                    $divide: [
                      { $add: ["$wins", { $multiply: ["$draws", 0.5] }] },
                      { $add: ["$wins", "$draws", "$losses"] },
                    ],
                  },
                  0,
                ],
              },
            },
          },
          { $sort: { games: -1 } },
        ],
        variantPerformance: [
          {
            $addFields: {
              resolvedVariantName: {
                $ifNull: ["$openingMapping.variantName", { $ifNull: ["$openingDetection.openingName", "$resolvedOpeningName"] }],
              },
              resolvedRepertoireId: { $ifNull: ["$openingMapping.repertoireId", "none"] },
            },
          },
          {
            $group: {
              _id: {
                repertoireId: "$resolvedRepertoireId",
                variantName: "$resolvedVariantName",
                repertoireName: "$openingMapping.repertoireName",
              },
              games: { $sum: 1 },
              wins: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "win"] }, 1, 0] } },
              draws: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "draw"] }, 1, 0] } },
              losses: { $sum: { $cond: [{ $eq: ["$perspectiveOutcome", "loss"] }, 1, 0] } },
              mappedGames: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$openingMapping.repertoireId", null] },
                        { $ne: ["$openingMapping.repertoireId", ""] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              manualReviewGames: { $sum: { $cond: [{ $eq: ["$openingMapping.requiresManualReview", true] }, 1, 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              variantKey: { $concat: ["$_id.repertoireId", "::", "$_id.variantName"] },
              variantName: "$_id.variantName",
              repertoireId: {
                $cond: [
                  { $eq: ["$_id.repertoireId", "none"] },
                  undefined,
                  "$_id.repertoireId",
                ],
              },
              repertoireName: "$_id.repertoireName",
              games: 1,
              wins: 1,
              draws: 1,
              losses: 1,
              mappedGames: 1,
              manualReviewGames: 1,
              successRate: {
                $cond: [
                  { $gt: [{ $add: ["$wins", "$draws", "$losses"] }, 0] },
                  {
                    $divide: [
                      { $add: ["$wins", { $multiply: ["$draws", 0.5] }] },
                      { $add: ["$wins", "$draws", "$losses"] },
                    ],
                  },
                  0,
                ],
              },
            },
          },
          { $sort: { games: -1, successRate: -1 } },
          { $limit: 40 },
        ],
        topOpenings: [
          {
            $group: {
              _id: "$resolvedOpeningName",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              openingName: "$_id",
              count: 1,
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
      },
    },
  ];
};

const buildLineCandidatesPipeline = (userId: string, filters: GameStatsFilters): Record<string, unknown>[] => {
  const commonStages = buildCommonComputedStages(userId, filters);
  return [
    ...commonStages,
    {
      $project: {
        source: 1,
        result: 1,
        orientation: 1,
        playedAt: 1,
        openingDetection: {
          eco: "$openingDetection.eco",
          lineMovesSan: { $ifNull: ["$openingDetection.lineMovesSan", []] },
          lineKey: "$openingDetection.lineKey",
          openingName: "$openingDetection.openingName",
        },
        openingMapping: {
          repertoireId: "$openingMapping.repertoireId",
          repertoireName: "$openingMapping.repertoireName",
          variantName: "$openingMapping.variantName",
          confidence: "$openingMapping.confidence",
          requiresManualReview: "$openingMapping.requiresManualReview",
        },
      },
    },
  ];
};

export async function getGamesStatsSummaryForUser(userId: string, filters: GameStatsFilters): Promise<GamesStatsSummary> {
  const db = getDB();
  const collection = db.collection<ImportedGameDocument>("importedGames");
  const [facetsResult] = await collection.aggregate<AggregatedStatsFacets>(buildStatsFacetPipeline(userId, filters)).toArray();
  const lineCandidateGames = await collection.aggregate<ImportedGameDocument>(buildLineCandidatesPipeline(userId, filters)).toArray();
  const variantTrainingInfoDocs = await db.collection("variantsInfo")
    .find({ userId })
    .project({ repertoireId: 1, variantName: 1, errors: 1, dueAt: 1, lastReviewedAt: 1, lastDate: 1 })
    .toArray();
  const variantTrainingByKey = new Map<string, VariantTrainingSignal>();
  variantTrainingInfoDocs.forEach((doc) => {
    const repertoireId = typeof doc.repertoireId === "string" ? doc.repertoireId : undefined;
    const variantName = typeof doc.variantName === "string" ? doc.variantName : undefined;
    if (!repertoireId || !variantName) {
      return;
    }
    variantTrainingByKey.set(buildVariantTrainingKey(repertoireId, variantName), {
      errors: typeof doc.errors === "number" ? doc.errors : 0,
      dueAt: doc.dueAt instanceof Date ? doc.dueAt : undefined,
      lastReviewedAt: doc.lastReviewedAt instanceof Date ? doc.lastReviewedAt : undefined,
      lastDate: doc.lastDate instanceof Date ? doc.lastDate : undefined,
    });
  });
  const totals = facetsResult?.totals?.[0] || {
    totalGames: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    mappedToRepertoireCount: 0,
    needsManualReviewCount: 0,
    uniqueLines: 0,
    winRate: 0,
  };
  const repertoires = await db.collection("repertoires").find({ userId }).project({ _id: 1, name: 1, moveNodes: 1, orientation: 1 }).toArray();
  const mappedByRepertoire = new Map(
    (facetsResult?.mappedByRepertoire || []).map((item) => [item.repertoireId, item.count])
  );
  const openingPerformanceWithSamples = facetsResult?.openingPerformance || [];
  const unmappedOpenings = openingPerformanceWithSamples
    .filter((opening) => (
      opening.openingName === "Unknown" ||
      opening.mappedGames === 0 ||
      opening.manualReviewGames / Math.max(opening.games, 1) >= 0.5
    ))
    .sort((a, b) => b.games - a.games)
    .slice(0, 10)
    .map((opening) => ({
      openingName: opening.openingName,
      games: opening.games,
      manualReviewGames: opening.manualReviewGames,
      mappedGames: opening.mappedGames,
      successRate: opening.successRate,
      sampleLine: opening.sampleLine,
    }));
  const unusedRepertoires = repertoires
    .map((repertoire) => ({
      repertoireId: String(repertoire._id),
      repertoireName: String(repertoire.name || "Unnamed repertoire"),
      mappedGames: mappedByRepertoire.get(String(repertoire._id)) || 0,
    }))
    .filter((repertoire) => repertoire.mappedGames === 0)
    .sort((a, b) => a.repertoireName.localeCompare(b.repertoireName))
    .slice(0, 12);
  return {
    totalGames: totals.totalGames,
    wins: totals.wins,
    draws: totals.draws,
    losses: totals.losses,
    winRate: totals.winRate,
    bySource: facetsResult?.bySource || [],
    mappedToRepertoireCount: totals.mappedToRepertoireCount,
    needsManualReviewCount: totals.needsManualReviewCount,
    uniqueLines: totals.uniqueLines,
    openingPerformance: openingPerformanceWithSamples.map((opening) => ({
      openingName: opening.openingName,
      games: opening.games,
      wins: opening.wins,
      draws: opening.draws,
      losses: opening.losses,
      mappedGames: opening.mappedGames,
      manualReviewGames: opening.manualReviewGames,
      successRate: opening.successRate,
    })),
    variantPerformance: facetsResult?.variantPerformance || [],
    gamesByMonth: facetsResult?.gamesByMonth || [],
    unmappedOpenings,
    unusedRepertoires,
    topOpenings: facetsResult?.topOpenings || [],
    linesToStudy: buildLinesToStudy(lineCandidateGames, variantTrainingByKey),
  };
}

export const getGamesStatsSummary = getGamesStatsSummaryForUser;
