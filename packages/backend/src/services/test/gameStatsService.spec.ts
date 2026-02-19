import { buildImportedGamesFilter, buildLinesToStudy, computeResults } from "../games/gameStatsService";
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
