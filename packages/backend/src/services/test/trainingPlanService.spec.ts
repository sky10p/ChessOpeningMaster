import * as mongo from "../../db/mongo";
import { GamesStatsSummary, LineStudyCandidate } from "@chess-opening-master/common";
import { generateTrainingPlanForUser, getLatestTrainingPlanForUser, markTrainingPlanItemDoneForUser } from "../games/trainingPlanService";
import * as gameStatsAggregationService from "../games/gameStatsAggregationService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

jest.mock("../games/gameStatsAggregationService", () => ({
  getGamesStatsSummaryForUser: jest.fn(),
}));

const lineCandidate = (overrides: Partial<LineStudyCandidate>): LineStudyCandidate => ({
  lineKey: "line-default",
  openingName: "Unknown",
  movesSan: ["e4", "e5"],
  sampleGameIds: ["g1"],
  games: 2,
  mappedGames: 1,
  manualReviewGames: 0,
  averageMappingConfidence: 0.8,
  repertoireGapScore: 0.2,
  wins: 1,
  draws: 0,
  losses: 1,
  deviationRate: 0.2,
  underperformanceScore: 0.3,
  recencyScore: 0.4,
  frequencyScore: 0.4,
  trainingErrors: 0,
  suggestedTasks: ["Review line"],
  ...overrides,
});

const summaryWithLines = (linesToStudy: LineStudyCandidate[]): GamesStatsSummary => ({
  totalGames: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  winRate: 0,
  bySource: [],
  mappedToRepertoireCount: 0,
  needsManualReviewCount: 0,
  uniqueLines: linesToStudy.length,
  openingPerformance: [],
  variantPerformance: [],
  gamesByMonth: [],
  unmappedOpenings: [],
  unusedRepertoires: [],
  topOpenings: [],
  linesToStudy,
});

describe("trainingPlanService", () => {
  const mockInsertOne = jest.fn();
  const mockFindOne = jest.fn();
  const mockUpdateOne = jest.fn();
  const mockCollection = {
    insertOne: mockInsertOne,
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
  };
  const mockDB = {
    collection: jest.fn(() => mockCollection),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
    mockInsertOne.mockResolvedValue({ acknowledged: true });
    mockFindOne.mockResolvedValue(null);
    mockUpdateOne.mockResolvedValue({ acknowledged: true });
  });

  it("prioritizes mapped lines and includes training error reasons", async () => {
    const errorLine = lineCandidate({
      lineKey: "line-error",
      openingName: "Sicilian Defense",
      variantName: "Open Sicilian",
      repertoireName: "Sicilian",
      mappedGames: 3,
      games: 4,
      wins: 1,
      losses: 3,
      underperformanceScore: 0.7,
      trainingErrors: 3,
      frequencyScore: 0.6,
      recencyScore: 0.8,
      deviationRate: 0.4,
    });
    const mappedLine = lineCandidate({
      lineKey: "line-mapped",
      openingName: "French Defense",
      repertoireName: "French Defense",
      variantName: "Classical",
      mappedGames: 2,
      games: 3,
      trainingErrors: 0,
      recencyScore: 0.2,
      frequencyScore: 0.2,
    });
    const unmappedLine = lineCandidate({
      lineKey: "line-unmapped",
      openingName: "Unknown",
      mappedGames: 0,
      variantName: undefined,
      repertoireName: undefined,
    });

    (gameStatsAggregationService.getGamesStatsSummaryForUser as jest.Mock).mockResolvedValueOnce(
      summaryWithLines([errorLine, mappedLine, unmappedLine])
    );

    const plan = await generateTrainingPlanForUser("user-1");

    expect(plan.items).toHaveLength(2);
    expect(plan.items.map((item) => item.lineKey)).toEqual(["line-error", "line-mapped"]);
    expect(plan.items[0].reasons.some((reason) => reason.includes("outstanding training errors"))).toBe(true);
    expect(plan.items[0].done).toBe(false);
    expect(mockInsertOne).toHaveBeenCalledTimes(1);
  });

  it("hydrates latest plan and applies active import filters", async () => {
    const line = lineCandidate({
      lineKey: "line-hydrated",
      openingName: "Caro-Kann Defense",
      repertoireName: "Caro-Kann",
      variantName: "Classical",
      games: 5,
      mappedGames: 4,
      trainingErrors: 1,
    });

    mockFindOne.mockResolvedValueOnce({
      userId: "user-1",
      id: "plan-1",
      generatedAt: "2026-02-01T00:00:00.000Z",
      generatedAtDate: new Date("2026-02-01T00:00:00.000Z"),
      weights: {
        frequency: 0.25,
        problem: 0.3,
        recency: 0.15,
        repertoireGap: 0.2,
        deviationRate: 0.1,
      },
      items: [
        {
          lineKey: "line-hydrated",
          openingName: "Unknown",
          movesSan: ["e4", "c6"],
          priority: 0.8,
          reasons: [],
          effort: "high",
          tasks: [],
          games: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          mappedGames: 0,
          manualReviewGames: 0,
          deviationRate: 0,
          trainingErrors: 0,
          done: false,
        },
        {
          lineKey: "line-missing",
          openingName: "Unknown",
          movesSan: ["d4", "d5"],
          priority: 0.1,
          reasons: [],
          effort: "low",
          tasks: [],
          games: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          mappedGames: 0,
          manualReviewGames: 0,
          deviationRate: 0,
          trainingErrors: 0,
          done: false,
        },
      ],
    });

    (gameStatsAggregationService.getGamesStatsSummaryForUser as jest.Mock).mockResolvedValueOnce(summaryWithLines([line]));

    const plan = await getLatestTrainingPlanForUser("user-1", { source: "manual" });

    expect(plan).not.toBeNull();
    expect(plan?.items).toHaveLength(1);
    expect(plan?.items[0].lineKey).toBe("line-hydrated");
    expect(plan?.items[0].openingName).toBe("Caro-Kann Defense");
    expect(plan?.items[0].repertoireName).toBe("Caro-Kann");
    expect(plan?.items[0].games).toBe(0);
  });

  it("marks training plan items as done", async () => {
    await markTrainingPlanItemDoneForUser("user-1", "plan-1", "line-key", true);

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { userId: "user-1", id: "plan-1", "items.lineKey": "line-key" },
      { $set: { "items.$.done": true } }
    );
  });
});
