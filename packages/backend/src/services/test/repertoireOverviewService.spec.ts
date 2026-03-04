import { MoveVariantNode } from "@chess-opening-master/common";
import * as mongo from "../../db/mongo";
import { getRepertoireOverview } from "../repertoireOverviewService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

jest.mock("../variantMistakeService", () => ({
  archiveStaleMistakesForRepertoire: jest.fn(async () => undefined),
}));

const createFindResult = (data: unknown[]) => ({
  sort: jest.fn().mockImplementation((sortSpec?: Record<string, 1 | -1>) => {
    const sorted = [...data];
    if (sortSpec?.order) {
      sorted.sort((left, right) => {
        const leftOrder = Number((left as { order?: number }).order || 0);
        const rightOrder = Number((right as { order?: number }).order || 0);
        return leftOrder - rightOrder;
      });
    }
    return {
      toArray: jest.fn().mockResolvedValue(sorted),
    };
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

const createMoveTree = () => {
  const e4 = move("e2e4", "e4", "w", "e2", "e4");
  const e5 = move("e7e5", "e5", "b", "e7", "e5");
  const nf3 = move("g1f3", "Nf3", "w", "g1", "f3");
  const nc6 = move("b8c6", "Nc6", "b", "b8", "c6");
  const bc4 = move("f1c4", "Bc4", "w", "f1", "c4");

  return {
    id: "initial",
    move: null,
    children: [
      {
        id: e4.lan,
        move: e4 as never,
        children: [
          {
            id: e5.lan,
            move: e5 as never,
            variantName: "Italian Game",
            children: [
              {
                id: nf3.lan,
                move: nf3 as never,
                children: [
                  {
                    id: nc6.lan,
                    move: nc6 as never,
                    children: [],
                  },
                  {
                    id: bc4.lan,
                    move: bc4 as never,
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

const createWeightedMoveTree = () => {
  const e4 = move("e2e4", "e4", "w", "e2", "e4");
  const e5 = move("e7e5", "e5", "b", "e7", "e5");
  const nf3 = move("g1f3", "Nf3", "w", "g1", "f3");
  const nc6 = move("b8c6", "Nc6", "b", "b8", "c6");
  const bc4 = move("f1c4", "Bc4", "w", "f1", "c4");
  const bc5 = move("f8c5", "Bc5", "b", "f8", "c5");

  return {
    id: "initial",
    move: null,
    children: [
      {
        id: e4.lan,
        move: e4 as never,
        children: [
          {
            id: e5.lan,
            move: e5 as never,
            variantName: "Italian Game",
            children: [
              {
                id: nf3.lan,
                move: nf3 as never,
                children: [
                  {
                    id: nc6.lan,
                    move: nc6 as never,
                    children: [],
                  },
                  {
                    id: bc4.lan,
                    move: bc4 as never,
                    children: [
                      {
                        id: bc5.lan,
                        move: bc5 as never,
                        children: [],
                      },
                    ],
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

const createMockDb = (data: {
  repertoires: unknown[];
  variantsInfo?: unknown[];
  variantMistakes?: unknown[];
}) => ({
  collection: jest.fn((name: string) => {
    if (name === "repertoires") {
      return {
        find: jest.fn().mockReturnValue(createFindResult(data.repertoires)),
      };
    }
    if (name === "variantsInfo") {
      return {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(data.variantsInfo || []),
        }),
      };
    }
    if (name === "variantMistakes") {
      return {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(data.variantMistakes || []),
        }),
      };
    }
    throw new Error(`Unknown collection: ${name}`);
  }),
});

describe("repertoireOverviewService", () => {
  const fixedNow = new Date("2026-02-15T12:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns disabled and favourite repertoires with aggregated status counts", async () => {
    const moveNodes = createMoveTree();
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
                  name: "Main White",
                  orientation: "white",
                  order: 1,
                  disabled: true,
                  favorite: true,
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
                  openingName: "Italian Game",
                  errors: 2,
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  masteryScore: 40,
                },
                {
                  repertoireId: "rep-1",
                  variantName: "Ghost Line",
                  openingName: "Ghost",
                  errors: 0,
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  masteryScore: 100,
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
                  openingName: "Italian Game",
                  mistakeKey: "k1",
                  positionFen: "fen",
                  variantStartFen: "start-fen",
                  variantStartPly: 0,
                  mistakePly: 4,
                  expectedMoveLan: "b8c6",
                  dueAt: new Date("2026-02-15T00:00:00.000Z"),
                  seenCount: 0,
                  solvedCount: 0,
                  createdAt: fixedNow,
                  updatedAt: fixedNow,
                },
                {
                  repertoireId: "rep-1",
                  variantName: "Ghost Line",
                  openingName: "Ghost",
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

    const result = await getRepertoireOverview("user-1");

    expect(result.repertoires).toHaveLength(1);
    expect(result.repertoires[0]).toMatchObject({
      repertoireId: "rep-1",
      repertoireName: "Main White",
      disabled: true,
      favorite: true,
      openingCount: 1,
      totalVariantsCount: 2,
      dueVariantsCount: 2,
      dueMistakesCount: 1,
      statusCounts: {
        total: 2,
        noErrors: 0,
        oneError: 0,
        twoErrors: 1,
        moreThanTwoErrors: 0,
        unresolved: 1,
      },
    });
    expect(result.repertoires[0].openings[0]).toMatchObject({
      openingName: "Italian Game",
      totalVariantsCount: 2,
      dueVariantsCount: 2,
      dueMistakesCount: 1,
      statusCounts: {
        total: 2,
        noErrors: 0,
        oneError: 0,
        twoErrors: 1,
        moreThanTwoErrors: 0,
        unresolved: 1,
      },
    });
  });

  it("returns empty openings safely when a repertoire has no move tree", async () => {
    (mongo.getDB as jest.Mock).mockReturnValue(
      createMockDb({
        repertoires: [
          {
            _id: { toString: () => "rep-empty" },
            name: "Empty Repertoire",
            orientation: "white",
            order: 1,
          },
        ],
      })
    );

    const result = await getRepertoireOverview("user-1");

    expect(result.repertoires).toEqual([
      expect.objectContaining({
        repertoireId: "rep-empty",
        openingCount: 0,
        openings: [],
        totalVariantsCount: 0,
        dueVariantsCount: 0,
        dueMistakesCount: 0,
      }),
    ]);
  });

  it("weights mastery by variant length and ignores same-day due variants and mistakes", async () => {
    const moveNodes = createWeightedMoveTree();
    const variants = MoveVariantNode.initMoveVariantNode(moveNodes as never).getVariants();
    const shortVariant = variants[0];
    const longVariant = variants[1];

    if (!shortVariant || !longVariant) {
      throw new Error("Expected weighted move tree to produce two variants");
    }

    (mongo.getDB as jest.Mock).mockReturnValue(
      createMockDb({
        repertoires: [
          {
            _id: { toString: () => "rep-weighted" },
            name: "Weighted White",
            orientation: "white",
            order: 1,
            moveNodes,
          },
        ],
        variantsInfo: [
          {
            repertoireId: "rep-weighted",
            variantName: shortVariant.fullName,
            errors: 1,
            dueAt: new Date("2026-02-15T00:00:00.000Z"),
            lastReviewedDayKey: "2026-02-15",
            masteryScore: 100,
          },
          {
            repertoireId: "rep-weighted",
            variantName: longVariant.fullName,
            errors: 4,
            dueAt: new Date("2026-02-16T00:00:00.000Z"),
            lastReviewedDayKey: "2026-02-15",
            masteryScore: 0,
          },
        ],
        variantMistakes: [
          {
            repertoireId: "rep-weighted",
            variantName: longVariant.fullName,
            openingName: "Italian Game",
            mistakeKey: "k1",
            positionFen: "fen",
            variantStartFen: "start-fen",
            variantStartPly: 0,
            mistakePly: 4,
            expectedMoveLan: "f8c5",
            dueAt: new Date("2026-02-15T00:00:00.000Z"),
            lastReviewedDayKey: "2026-02-15",
            seenCount: 0,
            solvedCount: 0,
            createdAt: fixedNow,
            updatedAt: fixedNow,
          },
        ],
      })
    );

    const result = await getRepertoireOverview("user-1");

    expect(result.repertoires[0]).toMatchObject({
      masteryScore: 44,
      dueVariantsCount: 0,
      dueMistakesCount: 0,
      statusCounts: {
        total: 2,
        noErrors: 0,
        oneError: 1,
        twoErrors: 0,
        moreThanTwoErrors: 1,
        unresolved: 0,
      },
    });
  });

  it("sorts repertoires by order and openings alphabetically", async () => {
    const italianTree = createMoveTree();
    const frenchTree = {
      id: "initial",
      move: null,
      children: [
        {
          id: "e2e4",
          move: move("e2e4", "e4", "w", "e2", "e4") as never,
          children: [
            {
              id: "e7e6",
              move: move("e7e6", "e6", "b", "e7", "e6") as never,
              variantName: "French Defense",
              children: [],
            },
          ],
        },
      ],
    };

    (mongo.getDB as jest.Mock).mockReturnValue(
      createMockDb({
        repertoires: [
          {
            _id: { toString: () => "rep-2" },
            name: "Second",
            orientation: "black",
            order: 2,
            moveNodes: italianTree,
          },
          {
            _id: { toString: () => "rep-1" },
            name: "First",
            orientation: "white",
            order: 1,
            moveNodes: frenchTree,
          },
        ],
      })
    );

    const result = await getRepertoireOverview("user-1");

    expect(result.repertoires.map((repertoire) => repertoire.repertoireId)).toEqual([
      "rep-1",
      "rep-2",
    ]);
    expect(result.repertoires[1].openings.map((opening) => opening.openingName)).toEqual([
      "Italian Game",
    ]);
  });
});
