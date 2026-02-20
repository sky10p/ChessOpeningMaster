import { GameStatsFilters, LineStudyCandidate } from "@chess-opening-master/common";
import { ImportedGameDocument } from "../../models/GameImport";
import { ImportedGamesFilters } from "./gameImportFilters";
import { resolveOpeningName } from "./openingDetectionService";
import { VariantTrainingSignal } from "./gameImportTypes";
import { parseDateStringOrThrow } from "../../utils/dateUtils";

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildVariantTrainingKey = (repertoireId: string, variantName: string): string => `${repertoireId}::${variantName.trim().toLowerCase()}`;

const toOptionalIsoString = (value?: Date): string | undefined => (value ? value.toISOString() : undefined);

export const buildStatsFilter = (userId: string, filters: GameStatsFilters): Record<string, unknown> => {
  const filter: Record<string, unknown> = { userId };
  if (filters.source) {
    filter.source = filters.source;
  }
  if (filters.dateFrom || filters.dateTo) {
    filter.playedAt = {
      ...(filters.dateFrom ? { $gte: parseDateStringOrThrow(filters.dateFrom, "dateFrom") } : {}),
      ...(filters.dateTo ? { $lte: parseDateStringOrThrow(filters.dateTo, "dateTo") } : {}),
    };
  }
  if (filters.ratedOnly) {
    filter.rated = true;
  }
  if (filters.color) {
    filter.orientation = filters.color;
  }
  if (filters.tournamentGroup) {
    filter.tournamentGroup = filters.tournamentGroup;
  }
  if (filters.mapped === "mapped") {
    filter["openingMapping.repertoireId"] = { $exists: true, $ne: null };
  }
  if (filters.mapped === "unmapped") {
    filter.$or = [
      { "openingMapping.repertoireId": { $exists: false } },
      { "openingMapping.repertoireId": null },
    ];
  }
  if (filters.openingQuery) {
    const query = filters.openingQuery.trim();
    if (query.length > 0) {
      const re = new RegExp(escapeRegex(query), "i");
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { "openingDetection.openingName": re },
            { "openingMapping.variantName": re },
            { "openingMapping.repertoireName": re },
            { "openingDetection.eco": re },
          ],
        },
      ];
    }
  }
  return filter;
};

export const buildImportedGamesFilter = (userId: string, filters: ImportedGamesFilters): Record<string, unknown> => {
  const filter: Record<string, unknown> = { userId };
  if (filters.source) {
    filter.source = filters.source;
  }
  if (filters.color) {
    filter.orientation = filters.color;
  }
  if (filters.dateFrom || filters.dateTo) {
    filter.playedAt = {
      ...(filters.dateFrom ? { $gte: parseDateStringOrThrow(filters.dateFrom, "dateFrom") } : {}),
      ...(filters.dateTo ? { $lte: parseDateStringOrThrow(filters.dateTo, "dateTo") } : {}),
    };
  }
  if (filters.mapped === "mapped") {
    filter["openingMapping.repertoireId"] = { $exists: true, $ne: null };
  }
  if (filters.mapped === "unmapped") {
    filter.$or = [
      { "openingMapping.repertoireId": { $exists: false } },
      { "openingMapping.repertoireId": null },
    ];
  }
  if (filters.openingQuery) {
    const query = filters.openingQuery.trim();
    if (query.length > 0) {
      const re = new RegExp(escapeRegex(query), "i");
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { "openingDetection.openingName": re },
            { "openingMapping.variantName": re },
            { "openingMapping.repertoireName": re },
            { "openingDetection.eco": re },
          ],
        },
      ];
    }
  }
  return filter;
};

export type PerspectiveOutcome = "win" | "draw" | "loss" | "unknown";

export const getPerspectiveOutcome = (game: ImportedGameDocument): PerspectiveOutcome => {
  if (game.orientation === "white") {
    if (game.result === "1-0") return "win";
    if (game.result === "0-1") return "loss";
    if (game.result === "1/2-1/2") return "draw";
    return "unknown";
  }
  if (game.orientation === "black") {
    if (game.result === "0-1") return "win";
    if (game.result === "1-0") return "loss";
    if (game.result === "1/2-1/2") return "draw";
    return "unknown";
  }
  if (game.result === "1/2-1/2") {
    return "draw";
  }
  return "unknown";
};

export const computeResults = (games: ImportedGameDocument[]) => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  games.forEach((game) => {
    const outcome = getPerspectiveOutcome(game);
    if (outcome === "win") {
      wins += 1;
      return;
    }
    if (outcome === "loss") {
      losses += 1;
      return;
    }
    if (outcome === "draw") {
      draws += 1;
    }
  });
  return { wins, draws, losses };
};

export const topOpenings = (games: ImportedGameDocument[]): Array<{ openingName: string; count: number }> => {
  const counts = new Map<string, number>();
  games.forEach((game) => {
    const openingName = resolveOpeningName(game);
    counts.set(openingName, (counts.get(openingName) || 0) + 1);
  });
  return [...counts.entries()].map(([openingName, count]) => ({ openingName, count })).sort((a, b) => b.count - a.count).slice(0, 10);
};

export const buildLinesToStudy = (
  games: ImportedGameDocument[],
  variantTrainingByKey: Map<string, VariantTrainingSignal>
): LineStudyCandidate[] => {
  const grouped = new Map<string, ImportedGameDocument[]>();
  games.forEach((game) => {
    const key = game.openingDetection.lineKey;
    grouped.set(key, [...(grouped.get(key) || []), game]);
  });
  const now = Date.now();
  return [...grouped.entries()].map(([lineKey, lineGames]) => {
    const { wins, draws, losses } = computeResults(lineGames);
    const total = lineGames.length;
    const mappedGames = lineGames.filter((game) => Boolean(game.openingMapping.repertoireId)).length;
    const manualReviewGames = lineGames.filter((game) => game.openingMapping.requiresManualReview).length;
    const deviationRate = total > 0 ? manualReviewGames / total : 0;
    const averageMappingConfidence = total > 0
      ? lineGames.reduce((sum, game) => sum + (game.openingMapping.confidence || 0), 0) / total
      : 0;
    const mappedRatio = total > 0 ? mappedGames / total : 0;
    const repertoireGapScore = 1 - Math.min(1, averageMappingConfidence * Math.max(mappedRatio, 0.1));
    const repertoireCounts = new Map<string, { repertoireId?: string; repertoireName: string; count: number }>();
    const variantCounts = new Map<string, { variantName: string; count: number }>();
    lineGames.forEach((game) => {
      if (!game.openingMapping.repertoireName) {
        if (game.openingMapping.variantName) {
          const existingVariant = variantCounts.get(game.openingMapping.variantName);
          variantCounts.set(game.openingMapping.variantName, {
            variantName: game.openingMapping.variantName,
            count: (existingVariant?.count || 0) + 1,
          });
        }
      } else {
        const key = game.openingMapping.repertoireId || game.openingMapping.repertoireName;
        const existing = repertoireCounts.get(key);
        if (existing) {
          repertoireCounts.set(key, { ...existing, count: existing.count + 1 });
        } else {
          repertoireCounts.set(key, {
            repertoireId: game.openingMapping.repertoireId,
            repertoireName: game.openingMapping.repertoireName,
            count: 1,
          });
        }
        if (game.openingMapping.variantName) {
          const existingVariant = variantCounts.get(game.openingMapping.variantName);
          variantCounts.set(game.openingMapping.variantName, {
            variantName: game.openingMapping.variantName,
            count: (existingVariant?.count || 0) + 1,
          });
        }
      }
    });
    const topRepertoire = [...repertoireCounts.values()].sort((a, b) => b.count - a.count)[0];
    const topRepertoireId = topRepertoire?.repertoireId;
    const repertoireName = topRepertoire?.repertoireName;
    const topVariant = [...variantCounts.values()].sort((a, b) => b.count - a.count)[0];
    const variantName = topVariant?.variantName;
    const trainingSignal = topRepertoireId && variantName
      ? variantTrainingByKey.get(buildVariantTrainingKey(topRepertoireId, variantName))
      : undefined;
    const trainingErrors = trainingSignal?.errors || 0;
    const trainingDueAt = toOptionalIsoString(trainingSignal?.dueAt);
    const trainingLastReviewedAt = toOptionalIsoString(trainingSignal?.lastReviewedAt || trainingSignal?.lastDate);
    const targetLabel = variantName || repertoireName || "this line";
    const winRate = total > 0 ? (wins + draws * 0.5) / total : 0;
    const underperformanceScore = 1 - winRate;
    const recentTs = Math.max(...lineGames.map((game) => game.playedAt?.getTime() || 0));
    const recencyScore = recentTs ? Math.max(0, 1 - (now - recentTs) / (1000 * 60 * 60 * 24 * 60)) : 0;
    const frequencyScore = Math.min(1, total / 10);
    const suggestedTasks = [
      trainingErrors > 0 ? `Fix ${trainingErrors} recorded training error${trainingErrors > 1 ? "s" : ""} in ${targetLabel}` : "",
      targetLabel && averageMappingConfidence >= 0.75
        ? `Review ${targetLabel} line until ply ${Math.min(14, lineGames[0].openingDetection.lineMovesSan.length)}`
        : "Map this line to your repertoire and verify move order",
      underperformanceScore > 0.45 ? "Replay your recent losses in this line and identify the first critical mistake" : "",
      deviationRate > 0.3 ? `Practice first ${Math.min(12, lineGames[0].openingDetection.lineMovesSan.length)} plies to reduce early deviations` : "",
      frequencyScore > 0.45 ? "Play 3 focused training games starting from this line" : "",
    ].filter(Boolean);
    return {
      lineKey,
      eco: lineGames[0].openingDetection.eco,
      openingName: resolveOpeningName(lineGames[0]),
      variantName,
      movesSan: lineGames[0].openingDetection.lineMovesSan,
      sampleGameIds: lineGames.slice(0, 3).map((game) => String(game._id || "")),
      repertoireName,
      games: total,
      mappedGames,
      manualReviewGames,
      averageMappingConfidence,
      repertoireGapScore,
      wins,
      draws,
      losses,
      deviationRate,
      underperformanceScore,
      recencyScore,
      frequencyScore,
      trainingErrors,
      trainingDueAt,
      trainingLastReviewedAt,
      suggestedTasks,
    };
  }).filter((line) => (
    line.games >= 2 ||
    line.underperformanceScore > 0.55 ||
    line.deviationRate > 0.5 ||
    (line.trainingErrors || 0) > 0 ||
    Boolean(line.trainingDueAt)
  ))
    .sort((a, b) => (
      ((b.trainingErrors || 0) * 0.15 + b.underperformanceScore + b.frequencyScore + b.recencyScore + b.deviationRate + b.repertoireGapScore) -
      ((a.trainingErrors || 0) * 0.15 + a.underperformanceScore + a.frequencyScore + a.recencyScore + a.deviationRate + a.repertoireGapScore)
    ))
    .slice(0, 12);
};
