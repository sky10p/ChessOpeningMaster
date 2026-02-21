import { buildImportedGamesFilter, buildLinesToStudy, buildStatsFilter, computeResults } from "../games/gameStatsService";
import { ImportedGameDocument } from "../../models/GameImport";

const createGame = (overrides: Partial<ImportedGameDocument>): ImportedGameDocument => ({
  userId: "user-1",
  source: "manual",
  dedupeKey: `k-${Math.random()}`,
  white: "w",
  black: "b",
  result: "1-0",
  pgn: "",
  movesSan: ["e4", "e5", "Nf3"],
  openingDetection: {
    openingName: "King Pawn",
    lineMovesSan: ["e4", "e5", "Nf3"],
    lineKey: "e4 e5 Nf3",
    confidence: 0.9,
  },
  openingMapping: {
    repertoireId: "rep-1",
    repertoireName: "King Pawn",
    variantName: "Italian",
    confidence: 0.9,
    strategy: "movePrefix",
    requiresManualReview: false,
  },
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("gameStatsService", () => {
  it("builds mapped filter", () => {
    const filter = buildImportedGamesFilter("user-1", { mapped: "mapped" });
    expect(filter).toEqual({
      userId: "user-1",
      "openingMapping.repertoireId": { $exists: true, $ne: null },
    });
  });

  it("builds playedAt date range with valid date filters", () => {
    const filter = buildStatsFilter("user-1", { dateFrom: "2026-02-01", dateTo: "2026-02-20" });
    expect(filter).toEqual({
      userId: "user-1",
      playedAt: {
        $gte: new Date("2026-02-01"),
        $lte: new Date("2026-02-20"),
      },
    });
  });

  it("throws 400 when dateFrom is invalid", () => {
    expect(() => buildImportedGamesFilter("user-1", { dateFrom: "not-a-date" })).toThrow("Invalid dateFrom date");
    try {
      buildImportedGamesFilter("user-1", { dateFrom: "not-a-date" });
    } catch (error) {
      expect((error as Error & { status?: number }).status).toBe(400);
    }
  });

  it("throws 400 when dateTo is invalid", () => {
    expect(() => buildStatsFilter("user-1", { dateTo: "bad-date" })).toThrow("Invalid dateTo date");
    try {
      buildStatsFilter("user-1", { dateTo: "bad-date" });
    } catch (error) {
      expect((error as Error & { status?: number }).status).toBe(400);
    }
  });

  it("computes perspective results", () => {
    const games: ImportedGameDocument[] = [
      createGame({ orientation: "white", result: "1-0" }),
      createGame({ orientation: "white", result: "0-1", dedupeKey: "k-2" }),
      createGame({ orientation: "black", result: "1/2-1/2", dedupeKey: "k-3" }),
    ];
    expect(computeResults(games)).toEqual({ wins: 1, draws: 1, losses: 1 });
  });

  it("builds lines to study with training signal", () => {
    const games: ImportedGameDocument[] = [
      createGame({
        _id: undefined,
        dedupeKey: "k-10",
        playedAt: new Date("2025-01-10T00:00:00.000Z"),
      }),
      createGame({
        dedupeKey: "k-11",
        result: "0-1",
        openingMapping: {
          repertoireId: "rep-1",
          repertoireName: "King Pawn",
          variantName: "Italian",
          confidence: 0.8,
          strategy: "movePrefix",
          requiresManualReview: true,
        },
        playedAt: new Date("2025-01-12T00:00:00.000Z"),
      }),
    ];

    const lines = buildLinesToStudy(
      games,
      new Map([
        ["rep-1::italian", { errors: 2 }],
      ])
    );

    expect(lines).toHaveLength(1);
    expect(lines[0].lineKey).toBe("e4 e5 Nf3");
    expect(lines[0].trainingErrors).toBe(2);
    expect(lines[0].games).toBe(2);
  });
});
