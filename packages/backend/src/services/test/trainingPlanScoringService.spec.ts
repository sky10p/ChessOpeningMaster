import { buildPriority, hasActiveImportedFilters, toTrainingStatsFilters } from "../games/trainingPlanScoringService";
import { LineStudyCandidate, TrainingPlanWeights } from "@chess-opening-master/common";

const line: LineStudyCandidate = {
  lineKey: "e4 e5 Nf3",
  openingName: "King Pawn",
  movesSan: ["e4", "e5", "Nf3"],
  sampleGameIds: ["g1"],
  games: 4,
  mappedGames: 3,
  manualReviewGames: 1,
  averageMappingConfidence: 0.8,
  repertoireGapScore: 0.2,
  wins: 2,
  draws: 1,
  losses: 1,
  deviationRate: 0.25,
  underperformanceScore: 0.35,
  recencyScore: 0.5,
  frequencyScore: 0.4,
  trainingErrors: 2,
  suggestedTasks: ["Task"],
};

const weights: TrainingPlanWeights = {
  frequency: 0.25,
  problem: 0.3,
  recency: 0.15,
  repertoireGap: 0.2,
  deviationRate: 0.1,
};

describe("trainingPlanScoringService", () => {
  it("computes positive priority score", () => {
    const score = buildPriority(line, weights, line.repertoireGapScore);
    expect(score).toBeGreaterThan(0);
  });

  it("increases priority when training errors increase", () => {
    const base = buildPriority({ ...line, trainingErrors: 0 }, weights, line.repertoireGapScore);
    const elevated = buildPriority({ ...line, trainingErrors: 4 }, weights, line.repertoireGapScore);
    expect(elevated).toBeGreaterThan(base);
  });

  it("caps training error impact above four errors", () => {
    const fourErrors = buildPriority({ ...line, trainingErrors: 4 }, weights, line.repertoireGapScore);
    const tenErrors = buildPriority({ ...line, trainingErrors: 10 }, weights, line.repertoireGapScore);
    expect(tenErrors).toBe(fourErrors);
  });

  it("maps imported filters to stats filters", () => {
    expect(toTrainingStatsFilters({ source: "manual", mapped: "mapped" })).toEqual({
      source: "manual",
      color: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      timeControlBucket: undefined,
      openingQuery: undefined,
      mapped: "mapped",
    });
  });

  it("detects active filters", () => {
    expect(hasActiveImportedFilters({ mapped: "all" })).toBe(false);
    expect(hasActiveImportedFilters({ source: "manual" })).toBe(true);
    expect(hasActiveImportedFilters({ mapped: "mapped" })).toBe(true);
  });
});
