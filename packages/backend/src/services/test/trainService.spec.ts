import { MoveVariantNode } from "@chess-opening-master/common";
import * as mongo from "../../db/mongo";
import { getTrainOpening, getTrainOverview } from "../trainService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

const createFindResult = (data: unknown[]) => ({
  sort: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue(data),
  }),
  toArray: jest.fn().mockResolvedValue(data),
});

const move = (
  lan: string,
  san: string,
  color: "w" | "b",
  from: string,
  to: string
) => ({ lan, san, color, from, to, piece: "p", flags: "n" });

const createSicilianMoveTree = () => {
  const e4 = move("e2e4", "e4", "w", "e2", "e4");
  const c5 = move("c7c5", "c5", "b", "c7", "c5");
  const nf3 = move("g1f3", "Nf3", "w", "g1", "f3");
  const d6 = move("d7d6", "d6", "b", "d7", "d6");
  const nc6 = move("b8c6", "Nc6", "b", "b8", "c6");
  return {
    id: "initial",
    move: null,
    children: [
      {
        id: e4.lan,
        move: e4 as never,
        children: [
          {
            id: c5.lan,
            move: c5 as never,
            variantName: "Sicilian Defense",
            children: [
              {
                id: nf3.lan,
                move: nf3 as never,
                children: [
                  {
                    id: d6.lan,
                    move: d6 as never,
                    children: [],
                  },
                  {
                    id: nc6.lan,
                    move: nc6 as never,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};

describe("trainService", () => {
  const fixedNow = new Date("2026-02-15T12:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("counts due variants from repertoire tree even when some variants have no variantsInfo", async () => {
    const moveNodes = createSicilianMoveTree();
    const treeVariants = MoveVariantNode.initMoveVariantNode(moveNodes as never).getVariants();
    const firstVariantName = treeVariants[0].fullName;
    const mockDb = {
      collection: jest.fn((name: string) => {
        if (name === "repertoires") {
          return {
            find: jest.fn().mockReturnValue(
              createFindResult([
                {
                  _id: { toString: () => "rep-1" },
                  name: "Rep 1",
                  orientation: "white",
                  moveNodes,
                },
              ])
            ),
          };
        }
        if (name === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  repertoireId: "rep-1",
                  variantName: firstVariantName,
                  openingName: "Sicilian Defense",
                  errors: 1,
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  masteryScore: 60,
                },
              ]),
            }),
          };
        }
        if (name === "variantMistakes") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        throw new Error(`Unknown collection: ${name}`);
      }),
    };
    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);

    const result = await getTrainOverview("user-1");

    expect(result.repertoires).toHaveLength(1);
    expect(result.repertoires[0].openings).toHaveLength(1);
    expect(result.repertoires[0].openings[0].openingName).toBe("Sicilian Defense");
    expect(result.repertoires[0].openings[0].totalVariantsCount).toBe(2);
    expect(result.repertoires[0].openings[0].dueVariantsCount).toBe(2);
  });

  it("ignores stale variant records that do not map to live repertoire openings", async () => {
    const moveNodes = createSicilianMoveTree();
    const treeVariants = MoveVariantNode.initMoveVariantNode(moveNodes as never).getVariants();
    const firstVariantName = treeVariants[0].fullName;
    const mockDb = {
      collection: jest.fn((name: string) => {
        if (name === "repertoires") {
          return {
            find: jest.fn().mockReturnValue(
              createFindResult([
                {
                  _id: { toString: () => "rep-1" },
                  name: "Rep 1",
                  orientation: "white",
                  moveNodes,
                },
              ])
            ),
          };
        }
        if (name === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  repertoireId: "rep-1",
                  variantName: firstVariantName,
                  openingName: "Sicilian Defense",
                  errors: 1,
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  masteryScore: 60,
                },
                {
                  repertoireId: "rep-1",
                  variantName: "French Defense: Ghost Line",
                  openingName: "French Defense",
                  errors: 3,
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  masteryScore: 20,
                },
              ]),
            }),
          };
        }
        if (name === "variantMistakes") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  repertoireId: "rep-1",
                  variantName: firstVariantName,
                  openingName: "Sicilian Defense",
                  mistakeKey: "live-k1",
                  positionFen: "fen",
                  variantStartFen: "start-fen",
                  variantStartPly: 0,
                  mistakePly: 4,
                  expectedMoveLan: "d7d6",
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  seenCount: 0,
                  solvedCount: 0,
                  createdAt: fixedNow,
                  updatedAt: fixedNow,
                },
                {
                  repertoireId: "rep-1",
                  variantName: "French Defense: Ghost Line",
                  openingName: "French Defense",
                  mistakeKey: "ghost-k1",
                  positionFen: "fen",
                  variantStartFen: "start-fen",
                  variantStartPly: 0,
                  mistakePly: 2,
                  expectedMoveLan: "e7e6",
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  seenCount: 0,
                  solvedCount: 0,
                  createdAt: fixedNow,
                  updatedAt: fixedNow,
                },
              ]),
            }),
          };
        }
        throw new Error(`Unknown collection: ${name}`);
      }),
    };
    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);

    const result = await getTrainOverview("user-1");

    expect(result.repertoires).toHaveLength(1);
    expect(result.repertoires[0].openings).toHaveLength(1);
    expect(result.repertoires[0].openings[0]).toMatchObject({
      openingName: "Sicilian Defense",
      totalVariantsCount: 2,
      dueVariantsCount: 2,
      dueMistakesCount: 1,
    });
  });

  it("returns opening detail with all opening variants, due counts, and mistakes", async () => {
    const moveNodes = createSicilianMoveTree();
    const treeVariants = MoveVariantNode.initMoveVariantNode(moveNodes as never).getVariants();
    const firstVariantName = treeVariants[0].fullName;
    const mockDb = {
      collection: jest.fn((name: string) => {
        if (name === "repertoires") {
          return {
            findOne: jest.fn().mockResolvedValue({
              _id: "rep-1",
              name: "Rep 1",
              orientation: "white",
              moveNodes,
            }),
          };
        }
        if (name === "variantsInfo") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([
                {
                  repertoireId: "rep-1",
                  variantName: firstVariantName,
                  openingName: "Sicilian Defense",
                  errors: 1,
                  masteryScore: 55,
                  perfectRunStreak: 1,
                  dailyErrorCount: 1,
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                },
              ]),
            }),
          };
        }
        if (name === "variantMistakes") {
          return {
            find: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([
                  {
                    repertoireId: "rep-1",
                    variantName: firstVariantName,
                    openingName: "Sicilian Defense",
                    mistakeKey: "k1",
                    positionFen: "fen",
                    variantStartFen: "start-fen",
                    variantStartPly: 0,
                    mistakePly: 4,
                    expectedMoveLan: "d7d6",
                    dueAt: new Date("2026-02-15T00:00:00.000Z"),
                    seenCount: 0,
                    solvedCount: 0,
                    createdAt: fixedNow,
                    updatedAt: fixedNow,
                  },
                ]),
              }),
              toArray: jest.fn().mockResolvedValue([
                {
                  repertoireId: "rep-1",
                  variantName: firstVariantName,
                  openingName: "Sicilian Defense",
                  mistakeKey: "k1",
                  positionFen: "fen",
                  variantStartFen: "start-fen",
                  variantStartPly: 0,
                  mistakePly: 4,
                  expectedMoveLan: "d7d6",
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  seenCount: 0,
                  solvedCount: 0,
                  createdAt: fixedNow,
                  updatedAt: fixedNow,
                },
              ]),
            }),
          };
        }
        if (name === "variantReviewHistory") {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          };
        }
        throw new Error(`Unknown collection: ${name}`);
      }),
    };
    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);

    const result = await getTrainOpening("user-1", "507f1f77bcf86cd799439011", "Sicilian Defense");

    expect(result).not.toBeNull();
    expect(result?.openingName).toBe("Sicilian Defense");
    expect(result?.variants).toHaveLength(2);
    expect(result?.mistakes).toHaveLength(1);
    expect(result?.stats.totalVariantsCount).toBe(2);
    expect(result?.stats.dueVariantsCount).toBe(2);
    expect(result?.stats.dueMistakesCount).toBe(1);
  });
});
