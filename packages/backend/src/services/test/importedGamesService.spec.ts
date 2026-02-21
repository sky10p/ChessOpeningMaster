import { clearImportedGamesForUser, listImportedGamesForUser } from "../games/importedGamesService";
import * as mongo from "../../db/mongo";

jest.mock("../../db/mongo");
jest.mock("../games/repertoireMetadataService", () => ({
  buildRepertoireMetadataById: jest.fn(() => new Map()),
}));
jest.mock("../games/openingDetectionService", () => ({
  normalizeImportedOpeningData: jest.fn((doc) => ({
    openingDetection: doc.openingDetection,
    openingMapping: doc.openingMapping,
  })),
}));

describe("importedGamesService", () => {
  const mockImportedGamesAggregateToArray = jest.fn();
  const mockImportedGamesAggregate = jest.fn().mockReturnValue({
    toArray: mockImportedGamesAggregateToArray,
  });
  const mockImportedGamesDeleteMany = jest.fn();
  const mockImportedGamesFindToArray = jest.fn();
  const mockImportedGamesFindLimit = jest.fn().mockReturnValue({
    toArray: mockImportedGamesFindToArray,
  });
  const mockImportedGamesFindSort = jest.fn().mockReturnValue({
    limit: mockImportedGamesFindLimit,
  });
  const mockImportedGamesFind = jest.fn().mockReturnValue({
    sort: mockImportedGamesFindSort,
  });
  const mockRepertoiresToArray = jest.fn();
  const mockRepertoiresProject = jest.fn().mockReturnValue({
    toArray: mockRepertoiresToArray,
  });
  const mockRepertoiresFind = jest.fn().mockReturnValue({
    project: mockRepertoiresProject,
  });
  const mockLinkedAccountsUpdateMany = jest.fn();

  const mockImportedGamesCollection = {
    aggregate: mockImportedGamesAggregate,
    find: mockImportedGamesFind,
    deleteMany: mockImportedGamesDeleteMany,
  };
  const mockRepertoiresCollection = {
    find: mockRepertoiresFind,
  };
  const mockLinkedAccountsCollection = {
    updateMany: mockLinkedAccountsUpdateMany,
  };

  const mockCollection = jest.fn((name: string) => {
    if (name === "importedGames") {
      return mockImportedGamesCollection;
    }
    if (name === "repertoires") {
      return mockRepertoiresCollection;
    }
    if (name === "linkedGameAccounts") {
      return mockLinkedAccountsCollection;
    }
    return {};
  });

  const mockDB = {
    collection: mockCollection,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
    mockRepertoiresToArray.mockResolvedValue([]);
    mockImportedGamesDeleteMany.mockResolvedValue({ deletedCount: 0 });
    mockImportedGamesAggregateToArray.mockResolvedValue([]);
  });

  it("uses aggregation when filtering by timeControlBucket", async () => {
    const playedAt = new Date("2024-01-01T00:00:00.000Z");
    mockImportedGamesAggregateToArray.mockResolvedValue([
      {
        _id: { toString: () => "id-1" },
        source: "lichess",
        providerGameId: "g-1",
        white: "w",
        black: "b",
        result: "1-0",
        timeControl: "300+0",
        timeControlBucket: "blitz",
        rated: true,
        playedAt,
        pgn: "",
        movesSan: [],
        orientation: "white",
      },
    ]);

    const result = await listImportedGamesForUser("user-1", 10, { timeControlBucket: "blitz" });

    expect(result).toHaveLength(1);
    expect(mockImportedGamesAggregate).toHaveBeenCalledTimes(1);
    expect(mockImportedGamesFind).not.toHaveBeenCalled();
    const pipeline = mockImportedGamesAggregate.mock.calls[0][0];
    expect(pipeline[pipeline.length - 1]).toEqual({ $limit: 10 });
  });

  it("uses find with exact limit when no timeControlBucket is provided", async () => {
    const playedAt = new Date("2024-01-01T00:00:00.000Z");
    mockImportedGamesFindToArray.mockResolvedValue([
      {
        _id: { toString: () => "id-2" },
        source: "lichess",
        providerGameId: "g-2",
        white: "w",
        black: "b",
        result: "1-0",
        timeControl: "300+0",
        timeControlBucket: "blitz",
        rated: true,
        playedAt,
        pgn: "",
        movesSan: [],
        orientation: "white",
      },
    ]);

    const result = await listImportedGamesForUser("user-1", 7, {});

    expect(result).toHaveLength(1);
    expect(mockImportedGamesAggregate).not.toHaveBeenCalled();
    expect(mockImportedGamesFind).toHaveBeenCalledTimes(1);
    expect(mockImportedGamesFindLimit).toHaveBeenCalledWith(7);
  });

  it("clears persisted and legacy games when filtering by timeControlBucket", async () => {
    mockImportedGamesDeleteMany
      .mockResolvedValueOnce({ deletedCount: 2 })
      .mockResolvedValueOnce({ deletedCount: 1 });
    mockImportedGamesAggregateToArray.mockResolvedValueOnce([{ _id: "legacy-game-id" }]);

    const deletedCount = await clearImportedGamesForUser("user-1", { timeControlBucket: "blitz" });

    expect(deletedCount).toBe(3);
    expect(mockImportedGamesDeleteMany).toHaveBeenCalledTimes(2);
    expect(mockImportedGamesDeleteMany.mock.calls[0][0].timeControlBucket).toBe("blitz");
    expect(mockImportedGamesDeleteMany.mock.calls[1][0]).toMatchObject({
      userId: "user-1",
      _id: { $in: ["legacy-game-id"] },
    });
    expect(mockImportedGamesAggregate).toHaveBeenCalledTimes(1);
    const pipeline = mockImportedGamesAggregate.mock.calls[0][0];
    expect(pipeline.some((stage: Record<string, unknown>) => "$addFields" in stage)).toBe(true);
    expect(mockLinkedAccountsUpdateMany).not.toHaveBeenCalled();
  });
});
