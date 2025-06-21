import { ObjectId } from "mongodb";
import { migrateAllRepertoireComments, extractComments } from "../utils/migrateRepertoireComments.utils";
import { MoveNode } from "../../models/Repertoire";
import { BoardOrientation } from "@chess-opening-master/common";
import * as mongo from "../../db/mongo";

jest.mock("../../db/mongo");
jest.mock("../utils/migrateRepertoireComments.utils", () => ({
  ...jest.requireActual("../utils/migrateRepertoireComments.utils"),
  extractComments: jest.fn(),
}));

const mockExtractComments = extractComments as jest.MockedFunction<typeof extractComments>;

describe("migrateRepertoireComments.utils", () => {
  const mockPositionsFindOne = jest.fn();
  const mockPositionsUpdateOne = jest.fn();
  const mockPositionsBulkWrite = jest
    .fn()
    .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  const mockPositionsFind = jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([]),
  });
  const mockPositionsCollection = {
    findOne: mockPositionsFindOne,
    updateOne: mockPositionsUpdateOne,
    find: mockPositionsFind,
    bulkWrite: mockPositionsBulkWrite,
  };
  const mockRepertoiresToArray = jest.fn();
  const mockRepertoiresFind = jest.fn().mockReturnValue({
    toArray: mockRepertoiresToArray,
  });
  const mockRepertoiresCollection = {
    find: mockRepertoiresFind,
  };
  const mockCollection = jest.fn().mockImplementation((collectionName) => {
    if (collectionName === "positions") {
      return mockPositionsCollection;
    } else if (collectionName === "repertoires") {
      return mockRepertoiresCollection;
    }
    return {};
  });

  const mockDB = {
    collection: mockCollection,
  };

  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);

    mockPositionsFindOne.mockResolvedValue(null);
    mockPositionsUpdateOne.mockResolvedValue({ modifiedCount: 1 });
    mockRepertoiresToArray.mockResolvedValue([]);    console.log = jest.fn();    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockExtractComments.mockImplementation((moveNode: MoveNode, commentsMap = new Map(), _orientation: BoardOrientation) => {
      const comments = commentsMap || new Map();
      
      const extractFromNode = (node: MoveNode) => {
        if (node.move && node.comment) {
          const fen = node.move.after;
          if (!comments.has(fen)) {
            comments.set(fen, []);
          }
          const commentsForFen = comments.get(fen);
          if (commentsForFen) {
            commentsForFen.push({
              comment: node.comment,
              repertoireId: "",
            });
          }
        }
        
        if (node.children) {
          for (const child of node.children) {
            extractFromNode(child);
          }
        }
      };
      
      extractFromNode(moveNode);
      return comments;
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe("migrateAllRepertoireComments", () => {
    const originalConsoleLog = console.log;

    beforeEach(() => {
      console.log = jest.fn();
    });

    afterEach(() => {
      console.log = originalConsoleLog;
    });

    const mockRepertoires = [
      {
        _id: new ObjectId("111111111111111111111111"),
        name: "Repertoire 1",
        updatedAt: new Date("2023-01-01"),
        moveNodes: {
          id: "root",
          move: null,
          children: [
            {
              id: "e2e4",
              move: {
                color: "w",
                piece: "p",
                from: "e2",
                to: "e4",
                san: "e4",
                flags: "b",
                lan: "e2e4",
                before:
                  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                after:
                  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              comment: "Repertoire 1 comment",
              children: [],
            },
          ],
        },
      },
      {
        _id: new ObjectId("222222222222222222222222"),
        name: "Repertoire 2",
        updatedAt: new Date("2023-01-02"),
        moveNodes: {
          id: "root",
          move: null,
          children: [
            {
              id: "e2e4",
              move: {
                color: "w",
                piece: "p",
                from: "e2",
                to: "e4",
                san: "e4",
                flags: "b",
                lan: "e2e4",
                before:
                  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                after:
                  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              comment: "Repertoire 2 comment",
              children: [],
            },
          ],
        },
      },
    ];
    it("should migrate all comments using keep_newest strategy", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const result = await migrateAllRepertoireComments("keep_newest");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);
      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Repertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });
    it("should migrate all comments using keep_longest strategy", async () => {
      const longerCommentRepertoires = [
        {
          _id: new ObjectId("111111111111111111111111"),
          name: "Repertoire 1",
          updatedAt: new Date("2023-01-01"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment:
                  "This is a much longer comment that should be selected by the keep_longest strategy",
                children: [],
              },
            ],
          },
        },
        {
          _id: new ObjectId("222222222222222222222222"),
          name: "Repertoire 2",
          updatedAt: new Date("2023-01-02"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "Short comment",
                children: [],
              },
            ],
          },
        },
      ];
      mockRepertoiresToArray.mockResolvedValue(longerCommentRepertoires);

      const result = await migrateAllRepertoireComments("keep_longest");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);
      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment:
                    "This is a much longer comment that should be selected by the keep_longest strategy",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });
    it("should migrate all comments using merge strategy", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const result = await migrateAllRepertoireComments("merge");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);
      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Repertoire 1 comment\n\nRepertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });
    it("should handle existing position comments during migration", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            comment: "Existing position comment",
            createdAt: new Date("2022-01-01"),
            updatedAt: new Date("2022-01-01"),
          },
        ]),
      });

      const result = await migrateAllRepertoireComments("merge");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);
      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment:
                    "Existing position comment\n\nRepertoire 1 comment\n\nRepertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
    });
    it("should handle interactive strategy correctly", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockResolvedValue("2");

      const result = await migrateAllRepertoireComments(
        "interactive",
        mockAskQuestion
      );

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);
      expect(mockAskQuestion).toHaveBeenCalled();

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Repertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });
    it("should handle empty repertoires collection", async () => {
      mockRepertoiresToArray.mockResolvedValue([]);

      const result = await migrateAllRepertoireComments();

      expect(result.processedRepertoires).toBe(0);
      expect(result.migratedComments).toBe(0);
      expect(result.conflicts).toBe(0);
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });

    it("should handle repertoires without comments", async () => {
      const noCommentsRepertoires = [
        {
          _id: new ObjectId("111111111111111111111111"),
          name: "Repertoire without comments",
          updatedAt: new Date("2023-01-01"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },

                children: [],
              },
            ],
          },
        },
      ];
      mockRepertoiresToArray.mockResolvedValue(noCommentsRepertoires);

      const result = await migrateAllRepertoireComments();

      expect(result.processedRepertoires).toBe(1);
      expect(result.migratedComments).toBe(0);
      expect(result.conflicts).toBe(0);
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });

    it("should handle a single repertoire with multiple positions with comments", async () => {
      const multiplePositionsRepertoire = [
        {
          _id: new ObjectId("111111111111111111111111"),
          name: "Repertoire with multiple comments",
          updatedAt: new Date("2023-01-01"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "First position comment",
                children: [
                  {
                    id: "e7e5",
                    move: {
                      color: "b",
                      piece: "p",
                      from: "e7",
                      to: "e5",
                      san: "e5",
                      flags: "b",
                      lan: "e7e5",
                      before:
                        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                      after:
                        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
                    },
                    comment: "Second position comment",
                    children: [],
                  },
                ],
              },
            ],
          },
        },
      ];
      mockRepertoiresToArray.mockResolvedValue(multiplePositionsRepertoire);

      const result = await migrateAllRepertoireComments();

      expect(result.processedRepertoires).toBe(1);
      expect(result.migratedComments).toBe(2);
      expect(result.conflicts).toBe(0);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "First position comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
              },
              update: {
                $set: {
                  comment: "Second position comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });

    it("should handle different positions without conflicts", async () => {
      const differentPositionsRepertoires = [
        {
          _id: new ObjectId("111111111111111111111111"),
          name: "Repertoire 1",
          updatedAt: new Date("2023-01-01"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "E4 comment",
                children: [],
              },
            ],
          },
        },
        {
          _id: new ObjectId("222222222222222222222222"),
          name: "Repertoire 2",
          updatedAt: new Date("2023-01-02"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "d2d4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "d2",
                  to: "d4",
                  san: "d4",
                  flags: "b",
                  lan: "d2d4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "D4 comment",
                children: [],
              },
            ],
          },
        },
      ];
      mockRepertoiresToArray.mockResolvedValue(differentPositionsRepertoires);

      const result = await migrateAllRepertoireComments();

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(2);
      expect(result.conflicts).toBe(0);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
            }),
          }),
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
              },
            }),
          }),
        ]),
        { ordered: false }
      );
    });

    it("should handle malformed data (missing updatedAt)", async () => {
      const malformedRepertoires = [
        {
          _id: new ObjectId("111111111111111111111111"),
          name: "Repertoire with missing updatedAt",

          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "Comment in repertoire without updatedAt",
                children: [],
              },
            ],
          },
        },
      ];
      mockRepertoiresToArray.mockResolvedValue(malformedRepertoires);

      const result = await migrateAllRepertoireComments();

      expect(result.processedRepertoires).toBe(1);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(0);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Comment in repertoire without updatedAt",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });
    it("should handle interactive strategy with merge option", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockResolvedValue("3");

      const result = await migrateAllRepertoireComments(
        "interactive",
        mockAskQuestion
      );

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockAskQuestion).toHaveBeenCalledTimes(1);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Repertoire 1 comment\n\nRepertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });
    it("should handle interactive strategy with custom comment option", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest
        .fn()
        .mockResolvedValueOnce("4")
        .mockResolvedValueOnce("This is my custom comment for this position");

      const result = await migrateAllRepertoireComments(
        "interactive",
        mockAskQuestion
      );

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockAskQuestion).toHaveBeenCalledTimes(2);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "This is my custom comment for this position",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });

    it("should handle interactive strategy with invalid choice fallback to merge", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockResolvedValue("99");

      const result = await migrateAllRepertoireComments(
        "interactive",
        mockAskQuestion
      );

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockAskQuestion).toHaveBeenCalledTimes(1);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Repertoire 1 comment\n\nRepertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });

    it("should handle interactive strategy without askQuestion function", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const result = await migrateAllRepertoireComments("interactive");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Repertoire 1 comment\n\nRepertoire 2 comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
    });    it("should handle bulkWrite error", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockError = new Error("Bulk write failed");
      mockPositionsBulkWrite.mockRejectedValueOnce(mockError);

      await expect(migrateAllRepertoireComments()).rejects.toThrow(
        "Bulk write failed"
      );

      expect(mockPositionsBulkWrite).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Bulk write failed:", mockError);
      
      consoleErrorSpy.mockRestore();
    });
    it("should handle bulkWrite with a large number of operations", async () => {
      const largeRepertoire = {
        _id: new ObjectId("111111111111111111111111"),
        name: "Large Repertoire",
        updatedAt: new Date("2023-01-01"),
        moveNodes: {
          id: "root",
          move: null,
          children: [] as MoveNode[],
        },
      };

      const generateFen = (index: number) =>
        `rnbqkbnr/pppppppp/8/8/${index}P3/${index}/PPPP1PPP/RNBQKBNR b KQkq - 0 1`;

      for (let i = 0; i < 100; i++) {
        largeRepertoire.moveNodes.children.push({
          id: `move-${i}`,
          move: {
            color: "w",
            piece: "p",
            from: "e2",
            to: "e4",
            san: "e4",
            flags: "b",
            lan: "e2e4",
            before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            after: generateFen(i),
          },
          comment: `Comment for position ${i}`,
          children: [],
        });
      }

      mockRepertoiresToArray.mockResolvedValue([largeRepertoire]);

      const result = await migrateAllRepertoireComments();

      expect(result.processedRepertoires).toBe(1);
      expect(result.migratedComments).toBe(100);
      expect(result.conflicts).toBe(0);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: { fen: generateFen(0) },
            }),
          }),
          expect.objectContaining({
            updateOne: expect.objectContaining({
              filter: { fen: generateFen(99) },
            }),
          }),
        ]),
        { ordered: false }
      );

      const bulkWriteArgs = mockPositionsBulkWrite.mock.calls[0][0];
      expect(bulkWriteArgs.length).toBe(100);
    });

    it("should handle interactive strategy with existing position comment choice", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            comment: "Existing position comment",
            createdAt: new Date("2022-01-01"),
            updatedAt: new Date("2022-01-01"),
          },
        ]),
      });

      const mockAskQuestion = jest.fn().mockResolvedValue("1");

      const result = await migrateAllRepertoireComments(
        "interactive",
        mockAskQuestion
      );

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockAskQuestion).toHaveBeenCalledTimes(1);

      expect(mockPositionsBulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: {
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              },
              update: {
                $set: {
                  comment: "Existing position comment",
                  updatedAt: expect.any(Date),
                },
                $setOnInsert: {
                  createdAt: expect.any(Date),
                },
              },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
    });

    it("should handle askQuestion timeout error", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockRejectedValue(
        new Error('Input timeout - no response received within 30 seconds')
      );

      await expect(
        migrateAllRepertoireComments("interactive", mockAskQuestion)
      ).rejects.toThrow('Input timeout - no response received within 30 seconds');

      expect(mockAskQuestion).toHaveBeenCalled();
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });

    it("should handle askQuestion readline error", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockRejectedValue(
        new Error('Readline interface error')
      );

      await expect(
        migrateAllRepertoireComments("interactive", mockAskQuestion)
      ).rejects.toThrow('Readline interface error');

      expect(mockAskQuestion).toHaveBeenCalled();
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });

    it("should handle askQuestion SIGINT interruption", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockRejectedValue(
        new Error('Process interrupted by user')
      );

      await expect(
        migrateAllRepertoireComments("interactive", mockAskQuestion)
      ).rejects.toThrow('Process interrupted by user');

      expect(mockAskQuestion).toHaveBeenCalled();
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });

    it("should handle askQuestion generic error", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const mockAskQuestion = jest.fn().mockRejectedValue(
        new Error('Unexpected error during user input')
      );

      await expect(
        migrateAllRepertoireComments("interactive", mockAskQuestion)
      ).rejects.toThrow('Unexpected error during user input');

      expect(mockAskQuestion).toHaveBeenCalled();
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });

    it("should handle askQuestion error with existing position comment", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            comment: "Existing position comment",
            createdAt: new Date("2022-01-01"),
            updatedAt: new Date("2022-01-01"),
          },
        ]),
      });

      const mockAskQuestion = jest.fn().mockRejectedValue(
        new Error('Input timeout - no response received within 30 seconds')
      );

      await expect(
        migrateAllRepertoireComments("interactive", mockAskQuestion)
      ).rejects.toThrow('Input timeout - no response received within 30 seconds');

      expect(mockAskQuestion).toHaveBeenCalled();
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
    });    it("should handle multiple askQuestion calls where second one fails", async () => {
      const multipleConflictRepertoires = [
        {
          _id: new ObjectId("111111111111111111111111"),
          name: "Repertoire 1",
          updatedAt: new Date("2023-01-01"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "First position comment",
                children: [],
              },
              {
                id: "d2d4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "d2",
                  to: "d4",
                  san: "d4",
                  flags: "b",
                  lan: "d2d4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "Second position comment",
                children: [],
              },
            ],
          },
        },
        {
          _id: new ObjectId("222222222222222222222222"),
          name: "Repertoire 2",
          updatedAt: new Date("2023-01-02"),
          moveNodes: {
            id: "root",
            move: null,
            children: [
              {
                id: "e2e4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "e2",
                  to: "e4",
                  san: "e4",
                  flags: "b",
                  lan: "e2e4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "Conflicting comment",
                children: [],
              },
              {
                id: "d2d4",
                move: {
                  color: "w",
                  piece: "p",
                  from: "d2",
                  to: "d4",
                  san: "d4",
                  flags: "b",
                  lan: "d2d4",
                  before:
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                  after:
                    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
                },
                comment: "Another conflicting comment for d4",
                children: [],
              },
            ],
          },
        },
      ];

      mockRepertoiresToArray.mockResolvedValue(multipleConflictRepertoires);

      const mockAskQuestion = jest.fn()
        .mockResolvedValueOnce("2")
        .mockRejectedValueOnce(new Error('Process interrupted by user'));

      await expect(
        migrateAllRepertoireComments("interactive", mockAskQuestion)
      ).rejects.toThrow('Process interrupted by user');

      expect(mockAskQuestion).toHaveBeenCalledTimes(2);
      expect(mockPositionsBulkWrite).not.toHaveBeenCalled();
    });
  });
});
