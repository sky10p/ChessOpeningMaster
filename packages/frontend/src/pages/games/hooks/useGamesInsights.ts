import React from "react";
import { GamesStatsSummary, ImportedGame, TrainingPlan } from "@chess-opening-master/common";
import { buildLineTitle, formatPercent, getOpeningLabel, isUnknownLabel, outcomePercentages } from "../utils";

type EnrichedTrainingPlanItem = {
  averageMappingConfidence?: number;
  frequencyScore?: number;
  underperformanceScore?: number;
};

type PathHint = "errors" | "due" | "new" | "study";

export const useGamesInsights = (stats: GamesStatsSummary | null, games: ImportedGame[], trainingPlan: TrainingPlan | null) => {
  const mappedRatio = stats && stats.totalGames > 0 ? stats.mappedToRepertoireCount / stats.totalGames : 0;
  const manualReviewRatio = stats && stats.totalGames > 0 ? stats.needsManualReviewCount / stats.totalGames : 0;
  const wdl = outcomePercentages(stats?.wins || 0, stats?.draws || 0, stats?.losses || 0);

  const variantPerformance = React.useMemo(() => (stats?.variantPerformance || []).filter((item) => item.games >= 2), [stats]);

  const weakestVariants = React.useMemo(() => [...variantPerformance]
    .sort((a, b) => a.successRate - b.successRate || b.games - a.games)
    .slice(0, 4), [variantPerformance]);

  const strongestVariants = React.useMemo(() => [...variantPerformance]
    .sort((a, b) => b.successRate - a.successRate || b.games - a.games)
    .slice(0, 4), [variantPerformance]);

  const focusLines = React.useMemo(() => stats?.linesToStudy || [], [stats]);
  const focusLineKeySet = React.useMemo(() => new Set(focusLines.map((line) => line.lineKey)), [focusLines]);
  const focusLineByKey = React.useMemo(() => new Map(focusLines.map((line) => [line.lineKey, line])), [focusLines]);

  const actionableTrainingItems = React.useMemo(() => (trainingPlan?.items || [])
    .filter((item) => focusLineKeySet.size === 0 || focusLineKeySet.has(item.lineKey))
    .filter((item) => item.mappedGames > 0 && Boolean(item.variantName || item.repertoireName))
    .map((item) => {
      const enrichedItem = item as typeof item & EnrichedTrainingPlanItem;
      const line = focusLineByKey.get(item.lineKey);
      const games = item.games || 1;
      const manualReviewRate = item.manualReviewGames / games;
      const mappingConfidence = enrichedItem.averageMappingConfidence ?? line?.averageMappingConfidence ?? 0;
      const dueSoon = item.trainingDueAt ? (new Date(item.trainingDueAt).getTime() <= Date.now()) : false;
      const pathHint: PathHint = (item.trainingErrors || 0) > 0
        ? "errors"
        : dueSoon
          ? "due"
          : (item.priority >= 0.7 || (enrichedItem.frequencyScore || 0) >= 0.45)
            ? "new"
            : "study";
      const whyNow = [
        (item.trainingErrors || 0) > 0 ? `${item.trainingErrors} training error${(item.trainingErrors || 0) > 1 ? "s" : ""}` : "",
        dueSoon ? "Training review is due now" : "",
        enrichedItem.underperformanceScore && enrichedItem.underperformanceScore > 0.4 ? `Low results in ${item.games} recent games` : "",
        manualReviewRate > 0.35 ? `${Math.round(manualReviewRate * 100)}% manual-review games` : "",
        item.deviationRate > 0.3 ? `${Math.round(item.deviationRate * 100)}% early deviation rate` : "",
      ].filter(Boolean);
      return {
        ...item,
        mappingConfidence,
        manualReviewRate,
        pathHint,
        whyNow,
      };
    })
    .sort((a, b) => ((b.trainingErrors || 0) - (a.trainingErrors || 0)) || (b.priority - a.priority)),
  [trainingPlan, focusLineKeySet, focusLineByKey]);

  const signalLines = React.useMemo(() => [...focusLines]
    .sort((a, b) => ((b.trainingErrors || 0) - (a.trainingErrors || 0)) || (b.deviationRate - a.deviationRate)),
  [focusLines]);

  const trainingItemsWithErrors = actionableTrainingItems.filter((item) => (item.trainingErrors || 0) > 0).length;
  const highPriorityTrainingItems = actionableTrainingItems.filter((item) => item.priority >= 0.7).length;
  const offBookSignalCount = signalLines.filter((line) => line.mappedGames === 0 || line.manualReviewGames > 0).length;

  const offBookOpenings = React.useMemo(() => (stats?.unmappedOpenings || [])
    .filter((opening) => opening.mappedGames === 0 || isUnknownLabel(opening.openingName))
    .slice(0, 8), [stats]);

  const gamesByMonth = stats?.gamesByMonth || [];
  const maxMonthGames = gamesByMonth.reduce((max, month) => Math.max(max, month.games), 0);

  const gamesByMonthGroups = React.useMemo(() => {
    const groups = new Map<string, ImportedGame[]>();
    games.forEach((game) => {
      const key = game.playedAt ? new Date(game.playedAt).toISOString().slice(0, 7) : "Unknown";
      groups.set(key, [...(groups.get(key) || []), game]);
    });
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [games]);

  const trainingIdeas = React.useMemo(() => {
    const ideas: string[] = [];
    const topWeak = weakestVariants[0];
    if (topWeak) {
      ideas.push(`Prioritize ${topWeak.variantName}: ${formatPercent(topWeak.successRate)} success in ${topWeak.games} games.`);
    }
    const offBook = offBookOpenings[0];
    if (offBook) {
      ideas.push(`Reduce off-book play in ${offBook.openingName}: ${offBook.manualReviewGames}/${offBook.games} games need manual review.`);
    }
    const unused = (stats?.unusedRepertoires || [])[0];
    if (unused) {
      ideas.push(`You have no mapped games in repertoire "${unused.repertoireName}". Add focused games for that side.`);
    }
    const topSource = [...(stats?.bySource || [])].sort((a, b) => b.count - a.count)[0];
    if (topSource) {
      ideas.push(`Most games come from ${topSource.source}. Keep this source synced daily.`);
    }
    return ideas;
  }, [weakestVariants, offBookOpenings, stats]);

  const openingTargetFromLine = React.useCallback((lineKey: string) => {
    const game = games.find((item) => item.openingDetection.lineKey === lineKey && item.openingMapping.repertoireId);
    if (!game?.openingMapping.repertoireId) {
      return null;
    }
    return {
      repertoireId: game.openingMapping.repertoireId,
      variantName: game.openingMapping.variantName || game.openingDetection.openingName || getOpeningLabel(game),
    };
  }, [games]);

  return {
    mappedRatio,
    manualReviewRatio,
    wdl,
    variantPerformance,
    weakestVariants,
    strongestVariants,
    focusLines,
    actionableTrainingItems,
    signalLines,
    trainingItemsWithErrors,
    highPriorityTrainingItems,
    offBookSignalCount,
    offBookOpenings,
    gamesByMonth,
    maxMonthGames,
    gamesByMonthGroups,
    trainingIdeas,
    openingTargetFromLine,
    buildLineTitle,
  };
};
