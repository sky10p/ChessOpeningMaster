import { ObjectId } from "mongodb";
import * as commonLib from "@chess-opening-master/common";
import * as mongo from "../../db/mongo";
import { repertoireMockData } from "../../mockData/repertoires.mocks";
import { variantsInfoMock } from "../../mockData/variantsInfo.mocks";
import { getAllVariants } from "../variantsService";

jest.mock("../../db/mongo", () => {
  const mockDB = {
    collection: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([]),
  };
  return {
    connectDB: jest.fn().mockResolvedValue({}),
    getDB: jest.fn().mockReturnValue(mockDB),
  };
});

jest.mock("@chess-opening-master/common", () => {
  const original = jest.requireActual("@chess-opening-master/common");
  const createMoveNode = (
    position: number,
    variantName?: string,
    after?: string,
    children: unknown[] = []
  ) => ({
    position,
    variantName,
    children,
    getMove: () => ({ after }),
  });
  const linkPath = <T extends { parent?: unknown; children?: unknown[] }>(moves: T[]) => {
    const root = { children: [moves[0]] };
    moves.forEach((move, index) => {
      move.parent = index === 0 ? root : moves[index - 1];
    });
    return moves;
  };
  return {
    ...original,
    MoveVariantNode: {
      ...original.MoveVariantNode,
      initMoveVariantNode: jest.fn().mockReturnValue({
        getVariants: jest.fn().mockReturnValue([
          {
            fullName: "Gambito escoces (4. ...Bc5 9. ...d6)",
            name: "Gambito escoces",
            moves: linkPath([
              createMoveNode(1, undefined, "fen-1"),
              createMoveNode(2, "Gambito escoces", "exact-start-fen"),
            ]),
          },
          {
            fullName: "Apertura Espanola (Variante cerrada)",
            name: "Apertura Espanola",
            moves: linkPath([createMoveNode(1, undefined, "fen-1")]),
          },
        ]),
      }),
    },
  };
});

const createTestMoveNode = (
  position: number,
  variantName?: string,
  after?: string,
  children: unknown[] = []
) => ({
  position,
  variantName,
  children,
  getMove: () => ({ after }),
});

const linkVariantMoves = <
  T extends { parent?: unknown; children?: unknown[]; position: number }
>(
  moves: T[]
): T[] => {
  const root = { children: [moves[0]] };
  moves.forEach((move, index) => {
    move.parent = index === 0 ? root : moves[index - 1];
  });
  return moves;
};

describe("variantsService", () => {
  interface MockDB {
    collection: jest.Mock;
  }

  let mockDB: MockDB;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDB = {
      collection: jest.fn().mockReturnThis(),
    };

    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
  });

  describe("getAllVariants", () => {
    it("should return empty arrays if no repertoires are found", async () => {
      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === "repertoires") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        if (collectionName === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        return mockDB;
      });

      const result = await getAllVariants("user-1");

      expect(result.newVariants).toEqual([]);
      expect(result.studiedVariants).toEqual([]);
      expect(mockDB.collection).toHaveBeenCalledWith("repertoires");
      expect(mockDB.collection).toHaveBeenCalledWith("variantsInfo");
    });

    it("should categorize variants correctly between new and studied", async () => {
      const repertoireId = "6444e7b3d9f33ea3203dd157";
      const variantInfoId = "675204d95abbd47059d2f101";

      const mockRepertoireData = {
        ...repertoireMockData,
        _id: new ObjectId(repertoireId),
        moveNodes: repertoireMockData.moveNodes,
      };

      const mockVariantsInfoData = {
        ...variantsInfoMock,
        _id: new ObjectId(variantInfoId),
        variantName: "Gambito escoces (4. ...Bc5 9. ...d6)",
      };

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === "repertoires") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockRepertoireData]),
            }),
          };
        }
        if (collectionName === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockVariantsInfoData]),
            }),
          };
        }
        return mockDB;
      });

      const mockGetVariants = jest.fn().mockReturnValue([
        {
          fullName: "Gambito escoces (4. ...Bc5 9. ...d6)",
          name: "Gambito escoces",
          moves: [
            createTestMoveNode(1, undefined, "fen-1"),
            createTestMoveNode(2, "Gambito escoces", "exact-start-fen"),
          ],
        },
        {
          fullName: "Apertura Espanola (Variante cerrada)",
          name: "Apertura Espanola",
          moves: [createTestMoveNode(1, undefined, "fen-1")],
        },
      ]);

      const mockInitMoveVariantNode = commonLib.MoveVariantNode.initMoveVariantNode as jest.Mock;
      mockInitMoveVariantNode.mockReturnValue({
        getVariants: mockGetVariants,
      });

      const result = await getAllVariants("user-1");

      expect(result.studiedVariants).toHaveLength(1);
      expect(result.studiedVariants[0].name).toBe("Gambito escoces (4. ...Bc5 9. ...d6)");
      expect(result.studiedVariants[0].repertoireId).toBe(repertoireId);
      expect(result.studiedVariants[0].startingFen).toBe("exact-start-fen");

      expect(result.newVariants).toHaveLength(1);
      expect(result.newVariants[0].name).toBe("Apertura Espanola (Variante cerrada)");
      expect(result.newVariants[0].repertoireId).toBe(repertoireId);
      expect(result.newVariants[0].startingFen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    });

    it("should skip disabled repertoires", async () => {
      const variantInfoId = "675204d95abbd47059d2f101";

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === "repertoires") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        if (collectionName === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  ...variantsInfoMock,
                  _id: new ObjectId(variantInfoId),
                  variantName: "Gambito escoces (4. ...Bc5 9. ...d6)",
                },
              ]),
            }),
          };
        }
        return mockDB;
      });

      const result = await getAllVariants("user-1");

      expect(result.studiedVariants).toHaveLength(0);
      expect(result.newVariants).toHaveLength(0);
    });

    it("should handle repertoires without moveNodes", async () => {
      const repertoireId = "6444e7b3d9f33ea3203dd157";
      const variantInfoId = "675204d95abbd47059d2f101";

      const mockRepertoireWithoutMoveNodes = {
        ...repertoireMockData,
        _id: new ObjectId(repertoireId),
        moveNodes: undefined,
      };

      const mockVariantsInfoData = {
        ...variantsInfoMock,
        _id: new ObjectId(variantInfoId),
        variantName: "Gambito escoces (4. ...Bc5 9. ...d6)",
      };

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === "repertoires") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockRepertoireWithoutMoveNodes]),
            }),
          };
        }
        if (collectionName === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockVariantsInfoData]),
            }),
          };
        }
        return mockDB;
      });

      const result = await getAllVariants("user-1");

      expect(result.studiedVariants).toHaveLength(0);
      expect(result.newVariants).toHaveLength(0);
    });

    it("should prefer the exact variant start fen over stored variant info startingFen", async () => {
      const repertoireId = "6444e7b3d9f33ea3203dd157";
      const variantInfoId = "675204d95abbd47059d2f101";

      const mockRepertoireData = {
        ...repertoireMockData,
        _id: new ObjectId(repertoireId),
        moveNodes: repertoireMockData.moveNodes,
      };

      const mockVariantsInfoData = {
        ...variantsInfoMock,
        _id: new ObjectId(variantInfoId),
        variantName: "Gambito escoces (4. ...Bc5 9. ...d6)",
        startingFen: "stale-opening-fen",
      };

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === "repertoires") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockRepertoireData]),
            }),
          };
        }
        if (collectionName === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockVariantsInfoData]),
            }),
          };
        }
        return mockDB;
      });

      const mockInitMoveVariantNode = commonLib.MoveVariantNode.initMoveVariantNode as jest.Mock;
      const anchor = createTestMoveNode(1, "Gambito escoces", "fen-1");
      const bridge = createTestMoveNode(2, undefined, "fen-2");
      const lastDerived = createTestMoveNode(3, undefined, "exact-start-fen");
      anchor.children = [bridge];
      bridge.children = [lastDerived, { position: 3 }];
      mockInitMoveVariantNode.mockReturnValue({
        getVariants: jest.fn().mockReturnValue([
          {
            fullName: "Gambito escoces (4. ...Bc5 9. ...d6)",
            name: "Gambito escoces",
            moves: linkVariantMoves([anchor, bridge, lastDerived]),
          },
        ]),
      });

      const result = await getAllVariants("user-1");

      expect(result.studiedVariants[0].startingFen).toBe("exact-start-fen");
    });

    it("should use the last derived branch move when multiple suffix moves define the variant entry", async () => {
      const repertoireId = "6444e7b3d9f33ea3203dd157";
      const variantInfoId = "675204d95abbd47059d2f101";

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === "repertoires") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  ...repertoireMockData,
                  _id: new ObjectId(repertoireId),
                  moveNodes: repertoireMockData.moveNodes,
                },
              ]),
            }),
          };
        }
        if (collectionName === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  ...variantsInfoMock,
                  _id: new ObjectId(variantInfoId),
                  variantName: "Gambito escoces (4. ...Bc5 9. ...d6)",
                },
              ]),
            }),
          };
        }
        return mockDB;
      });

      const anchor = createTestMoveNode(1, "Gambito escoces", "fen-anchor");
      const firstDerived = createTestMoveNode(2, undefined, "fen-after-bc5");
      const middle = createTestMoveNode(3, undefined, "fen-middle");
      const lastDerived = createTestMoveNode(4, undefined, "fen-after-d6");
      anchor.children = [firstDerived, { position: 2 }];
      firstDerived.children = [middle];
      middle.children = [lastDerived, { position: 4 }];

      const mockInitMoveVariantNode = commonLib.MoveVariantNode.initMoveVariantNode as jest.Mock;
      mockInitMoveVariantNode.mockReturnValue({
        getVariants: jest.fn().mockReturnValue([
          {
            fullName: "Gambito escoces (4. ...Bc5 9. ...d6)",
            name: "Gambito escoces",
            moves: linkVariantMoves([anchor, firstDerived, middle, lastDerived]),
          },
        ]),
      });

      const result = await getAllVariants("user-1");

      expect(result.studiedVariants[0].startingFen).toBe("fen-after-d6");
    });
  });
});
