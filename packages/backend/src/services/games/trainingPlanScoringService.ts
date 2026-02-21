import { GameStatsFilters, LineStudyCandidate, TrainingPlanWeights } from "@chess-opening-master/common";
import { ImportedGamesFilters } from "./gameImportFilters";

export const buildPriority = (line: LineStudyCandidate, weights: TrainingPlanWeights, repertoireGap: number): number => {
  const problem = Math.min(1, line.underperformanceScore + line.deviationRate * 0.5);
  const trainingErrorScore = Math.min(1, (line.trainingErrors || 0) / 4);
  return (
    weights.frequency * line.frequencyScore +
    weights.problem * (problem + trainingErrorScore * 0.6) +
    weights.recency * line.recencyScore +
    weights.repertoireGap * repertoireGap +
    weights.deviationRate * line.deviationRate
  );
};

export const toTrainingStatsFilters = (filters?: ImportedGamesFilters): GameStatsFilters => ({
  source: filters?.source,
  color: filters?.color,
  dateFrom: filters?.dateFrom,
  dateTo: filters?.dateTo,
  timeControlBucket: filters?.timeControlBucket,
  openingQuery: filters?.openingQuery,
  mapped: filters?.mapped,
});

export const hasActiveImportedFilters = (filters?: ImportedGamesFilters): boolean => Boolean(
  filters?.source
  || filters?.color
  || filters?.dateFrom
  || filters?.dateTo
  || filters?.timeControlBucket
  || filters?.openingQuery
  || (filters?.mapped && filters.mapped !== "all")
);
