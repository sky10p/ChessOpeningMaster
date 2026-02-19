import { ObjectId } from "mongodb";
import * as mongo from "../../db/mongo";
import { manualPgnProvider } from "../games/providers/manualPgnProvider";
import { importGamesForUser } from "../games/gameImportService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

jest.mock("../games/providers/manualPgnProvider", () => ({
  manualPgnProvider: {
    importGames: jest.fn(),
  },
}));

describe("gameImportService import cache", () => {
  const mockImportedGamesFindOne = jest.fn();
  const mockImportedGamesInsertOne = jest.fn();
  const mockLinkedAccountsFindOne = jest.fn();
  const mockLinkedAccountsUpdateOne = jest.fn();
  const mockRepertoiresFind = jest.fn();
  const mockRepertoiresProject = jest.fn();
  const mockRepertoiresToArray = jest.fn();

  const mockDB = {
    collection: jest.fn((name: string) => {
      if (name === "importedGames") {
        return {
          findOne: mockImportedGamesFindOne,
          insertOne: mockImportedGamesInsertOne,
        };
      }
      if (name === "repertoires") {
        return {
          find: mockRepertoiresFind,
        };
      }
      if (name === "linkedGameAccounts") {
        return {
          findOne: mockLinkedAccountsFindOne,
          updateOne: mockLinkedAccountsUpdateOne,
        };
      }
      throw new Error(`Unknown collection: ${name}`);
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
    mockImportedGamesFindOne.mockResolvedValue(null);
    mockImportedGamesInsertOne.mockResolvedValue({ acknowledged: true });
    mockLinkedAccountsFindOne.mockResolvedValue(null);
    mockLinkedAccountsUpdateOne.mockResolvedValue({ acknowledged: true });
    mockRepertoiresToArray.mockResolvedValue([
      {
        _id: new ObjectId(),
        userId: "user-1",
        name: "King Pawn",
        orientation: "white",
        moveNodes: {},
      },
    ]);
    mockRepertoiresProject.mockReturnValue({
      toArray: mockRepertoiresToArray,
    });
    mockRepertoiresFind.mockReturnValue({
      project: mockRepertoiresProject,
    });
  });

  it("loads repertoire metadata once for all games in one manual import batch", async () => {
    (manualPgnProvider.importGames as jest.Mock).mockResolvedValueOnce([
      {
        pgn: "[Event \"Test\"]",
        headers: {
          White: "player-white",
          Black: "player-black",
          Result: "1-0",
          Date: "2024.01.01",
        },
        movesSan: ["e4", "e5", "Nf3"],
      },
      {
        pgn: "[Event \"Test 2\"]",
        headers: {
          White: "player-white-2",
          Black: "player-black-2",
          Result: "0-1",
          Date: "2024.01.02",
        },
        movesSan: ["d4", "d5", "c4"],
      },
    ]);

    const summary = await importGamesForUser("user-1", {
      source: "manual",
      pgn: "multi-game",
    });

    expect(summary.importedCount).toBe(2);
    expect(summary.duplicateCount).toBe(0);
    expect(summary.failedCount).toBe(0);
    expect(summary.processedCount).toBe(2);
    expect(mockRepertoiresFind).toHaveBeenCalledTimes(1);
    expect(mockRepertoiresFind).toHaveBeenCalledWith({ userId: "user-1" });
    expect(mockImportedGamesInsertOne).toHaveBeenCalledTimes(2);
  });

  it("does not reuse repertoire cache across separate imports", async () => {
    (manualPgnProvider.importGames as jest.Mock)
      .mockResolvedValueOnce([
        {
          pgn: "[Event \"Batch 1\"]",
          headers: {
            White: "first-white",
            Black: "first-black",
            Result: "1-0",
            Date: "2024.01.03",
          },
          movesSan: ["e4", "e5"],
        },
      ])
      .mockResolvedValueOnce([
        {
          pgn: "[Event \"Batch 2\"]",
          headers: {
            White: "second-white",
            Black: "second-black",
            Result: "1/2-1/2",
            Date: "2024.01.04",
          },
          movesSan: ["c4", "e5"],
        },
      ]);

    const firstSummary = await importGamesForUser("user-1", {
      source: "manual",
      pgn: "batch-one",
    });
    const secondSummary = await importGamesForUser("user-1", {
      source: "manual",
      pgn: "batch-two",
    });

    expect(firstSummary.importedCount).toBe(1);
    expect(secondSummary.importedCount).toBe(1);
    expect(mockRepertoiresFind).toHaveBeenCalledTimes(2);
    expect(mockRepertoiresFind).toHaveBeenNthCalledWith(1, { userId: "user-1" });
    expect(mockRepertoiresFind).toHaveBeenNthCalledWith(2, { userId: "user-1" });
  });
});
