import { ObjectId } from "mongodb";
import { TrainingPlan, TrainingPlanWeights } from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { DEFAULT_TRAINING_PLAN_WEIGHTS, TrainingPlanDocument } from "../../models/GameImport";
import type { ImportedGamesFilters } from "./gameImportFilters";
import { buildPriority, hasActiveImportedFilters, toTrainingStatsFilters } from "./trainingPlanScoringService";
import { getGamesStatsSummaryForUser } from "./gameStatsAggregationService";

type EnrichedTrainingPlanItem = {
  averageMappingConfidence?: number;
  repertoireGapScore?: number;
  underperformanceScore?: number;
  recencyScore?: number;
  frequencyScore?: number;
};

export async function generateTrainingPlanForUser(
  userId: string,
  weights?: Partial<TrainingPlanWeights>,
  filters?: ImportedGamesFilters
): Promise<TrainingPlan> {
  const mergedWeights: TrainingPlanWeights = { ...DEFAULT_TRAINING_PLAN_WEIGHTS, ...weights };
  const stats = await getGamesStatsSummaryForUser(userId, toTrainingStatsFilters(filters));
  const db = getDB();
  const matchedLines = stats.linesToStudy.filter((line) => line.mappedGames > 0 && Boolean(line.variantName || line.repertoireName));
  const highSignalUnmappedLines = stats.linesToStudy.filter((line) =>
    (!line.mappedGames || !Boolean(line.variantName || line.repertoireName))
    && (
      (line.trainingErrors || 0) > 0
      || line.deviationRate >= 0.35
      || line.underperformanceScore >= 0.5
      || line.frequencyScore >= 0.4
      || line.manualReviewGames > 0
    )
  );
  const trainingErrorMatchedLines = matchedLines.filter((line) => (line.trainingErrors || 0) > 0);
  const prioritizedSource = trainingErrorMatchedLines.length > 0
    ? [...trainingErrorMatchedLines, ...matchedLines.filter((line) => (line.trainingErrors || 0) === 0), ...highSignalUnmappedLines]
    : (
      matchedLines.length > 0
        ? [...matchedLines, ...highSignalUnmappedLines]
        : stats.linesToStudy
    );
  const seen = new Set<string>();
  const candidateLines = prioritizedSource.filter((line) => {
    if (seen.has(line.lineKey)) {
      return false;
    }
    seen.add(line.lineKey);
    return true;
  });

  const items = candidateLines.map((line) => {
    const repertoireGap = line.repertoireGapScore;
    const priority = buildPriority(line, mergedWeights, repertoireGap);
    return {
      lineKey: line.lineKey,
      openingName: line.openingName,
      variantName: line.variantName,
      repertoireName: line.repertoireName,
      movesSan: line.movesSan,
      priority,
      reasons: [
        (line.trainingErrors || 0) > 0 ? `${line.trainingErrors} outstanding training error${(line.trainingErrors || 0) > 1 ? "s" : ""} in this variant` : "",
        line.underperformanceScore > 0.4 ? `Win rate ${((1 - line.underperformanceScore) * 100).toFixed(0)}% in ${line.games} games` : "",
        line.frequencyScore > 0.4 ? "High frequency in your games" : "",
        line.recencyScore > 0.5 ? "Recently played line" : "",
        line.deviationRate > 0.3 ? `${line.manualReviewGames}/${line.games} games deviated early from repertoire` : "",
        line.repertoireGapScore > 0.45 ? "Weak repertoire coverage confidence" : "",
      ].filter(Boolean),
      effort: (priority > 0.7 ? "high" : priority > 0.4 ? "medium" : "low") as "high" | "medium" | "low",
      tasks: line.suggestedTasks,
      games: line.games,
      wins: line.wins,
      draws: line.draws,
      losses: line.losses,
      mappedGames: line.mappedGames,
      manualReviewGames: line.manualReviewGames,
      deviationRate: line.deviationRate,
      averageMappingConfidence: line.averageMappingConfidence,
      repertoireGapScore: line.repertoireGapScore,
      underperformanceScore: line.underperformanceScore,
      recencyScore: line.recencyScore,
      frequencyScore: line.frequencyScore,
      trainingErrors: line.trainingErrors,
      trainingDueAt: line.trainingDueAt,
      trainingLastReviewedAt: line.trainingLastReviewedAt,
      done: false,
    };
  }).sort((a, b) => b.priority - a.priority);

  const plan: TrainingPlan = {
    id: new ObjectId().toString(),
    generatedAt: new Date().toISOString(),
    weights: mergedWeights,
    items,
  };

  const doc: TrainingPlanDocument = {
    ...plan,
    userId,
    generatedAtDate: new Date(plan.generatedAt),
  };
  await db.collection<TrainingPlanDocument>("trainingPlans").insertOne(doc);
  return plan;
}

export async function getLatestTrainingPlanForUser(userId: string, filters?: ImportedGamesFilters): Promise<TrainingPlan | null> {
  const db = getDB();
  const plan = await db.collection<TrainingPlanDocument>("trainingPlans").findOne({ userId }, { sort: { generatedAtDate: -1 } });
  if (!plan) {
    return null;
  }
  const stats = await getGamesStatsSummaryForUser(userId, toTrainingStatsFilters(filters));
  const lineByKey = new Map(stats.linesToStudy.map((line) => [line.lineKey, line]));
  const hydratedItems = plan.items.map((item) => {
    const enrichedItem = item as typeof item & EnrichedTrainingPlanItem;
    const line = lineByKey.get(item.lineKey);
    const priority = typeof item.priority === "number" ? item.priority : 0;
    return {
      ...item,
      openingName: item.openingName && item.openingName !== "Unknown" ? item.openingName : (line?.openingName || "Unknown"),
      variantName: item.variantName || line?.variantName,
      repertoireName: item.repertoireName || line?.repertoireName,
      reasons: Array.isArray(item.reasons) ? item.reasons : [],
      tasks: Array.isArray(item.tasks) ? item.tasks : [],
      effort: item.effort || (priority > 0.7 ? "high" : priority > 0.4 ? "medium" : "low"),
      games: typeof item.games === "number" ? item.games : (line?.games || 0),
      wins: typeof item.wins === "number" ? item.wins : (line?.wins || 0),
      draws: typeof item.draws === "number" ? item.draws : (line?.draws || 0),
      losses: typeof item.losses === "number" ? item.losses : (line?.losses || 0),
      mappedGames: typeof item.mappedGames === "number" ? item.mappedGames : (line?.mappedGames || 0),
      manualReviewGames: typeof item.manualReviewGames === "number" ? item.manualReviewGames : (line?.manualReviewGames || 0),
      deviationRate: typeof item.deviationRate === "number" ? item.deviationRate : (line?.deviationRate || 0),
      averageMappingConfidence: typeof enrichedItem.averageMappingConfidence === "number" ? enrichedItem.averageMappingConfidence : (line?.averageMappingConfidence || 0),
      repertoireGapScore: typeof enrichedItem.repertoireGapScore === "number" ? enrichedItem.repertoireGapScore : (line?.repertoireGapScore || 0),
      underperformanceScore: typeof enrichedItem.underperformanceScore === "number" ? enrichedItem.underperformanceScore : (line?.underperformanceScore || 0),
      recencyScore: typeof enrichedItem.recencyScore === "number" ? enrichedItem.recencyScore : (line?.recencyScore || 0),
      frequencyScore: typeof enrichedItem.frequencyScore === "number" ? enrichedItem.frequencyScore : (line?.frequencyScore || 0),
      trainingErrors: typeof item.trainingErrors === "number" ? item.trainingErrors : (line?.trainingErrors || 0),
      trainingDueAt: item.trainingDueAt || line?.trainingDueAt,
      trainingLastReviewedAt: item.trainingLastReviewedAt || line?.trainingLastReviewedAt,
      done: Boolean(item.done),
    };
  });
  const items = hasActiveImportedFilters(filters)
    ? hydratedItems.filter((item) => lineByKey.has(item.lineKey))
    : hydratedItems;
  return {
    id: plan.id,
    generatedAt: plan.generatedAt,
    weights: plan.weights,
    items,
  };
}

export async function markTrainingPlanItemDoneForUser(userId: string, planId: string, lineKey: string, done: boolean): Promise<void> {
  const db = getDB();
  await db.collection<TrainingPlanDocument>("trainingPlans").updateOne(
    { userId, id: planId, "items.lineKey": lineKey },
    { $set: { "items.$.done": done } }
  );
}
