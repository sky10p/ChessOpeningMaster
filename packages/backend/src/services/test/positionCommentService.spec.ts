import { ObjectId } from "mongodb";
import {
  extractComments,
  migrateAllRepertoireComments,
  getPositionComment,
} from "../positionCommentService";
import { MoveNode } from "../../models/Repertoire";
import * as mongo from "../../db/mongo";

jest.mock("../../db/mongo");

describe("positionCommentService", () => {
  const mockPositionsFindOne = jest.fn();
  const mockPositionsUpdateOne = jest.fn();
  const mockPositionsCollection = {
    findOne: mockPositionsFindOne,
    updateOne: mockPositionsUpdateOne,
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
    mockRepertoiresToArray.mockResolvedValue([]);
    
    console.log = jest.fn();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe("extractComments", () => {
    it("should extract comments from a move node tree", () => {
      const moveNode: MoveNode = {
        id: "root",
        move: {
          color: "w",
          piece: "p",
          from: "e2",
          to: "e4",
          san: "e4",
          flags: "b",
          lan: "e2e4",
          before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        },
        comment: "Root comment",
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
            comment: "Child comment",
            children: [],
          },
        ],
      };
      const comments = extractComments(moveNode);

      expect(comments.size).toBe(2);      const rootComments = comments.get(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
      );
      expect(rootComments).toBeDefined();
      expect(rootComments && rootComments[0].comment).toBe("Root comment");

      const childComments = comments.get(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
      );
      expect(childComments).toBeDefined();
      expect(childComments && childComments[0].comment).toBe("Child comment");
    });

    it("should handle move nodes without comments", () => {
      const moveNode: MoveNode = {
        id: "root",
        move: {
          color: "w",
          piece: "p",
          from: "e2",
          to: "e4",
          san: "e4",
          flags: "b",
          lan: "e2e4",
          before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        },
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
            comment: "Child comment",
            children: [],
          },
        ],
      };
      const comments = extractComments(moveNode);

      expect(comments.size).toBe(1);

      const rootComments = comments.get(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
      );
      expect(rootComments).toBeUndefined();      const childComments = comments.get(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
      );
      expect(childComments).toBeDefined();
      expect(childComments && childComments[0].comment).toBe("Child comment");
    });
    it("should handle nested children with comments", () => {
      const moveNode: MoveNode = {
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
            comment: "First move comment",
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
                comment: "Response comment",
                children: [
                  {
                    id: "g1f3",
                    move: {
                      color: "w",
                      piece: "n",
                      from: "g1",
                      to: "f3",
                      san: "Nf3",
                      flags: "n",
                      lan: "g1f3",
                      before:
                        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
                      after:
                        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
                    },
                    comment: "Third move comment",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      };
      const comments = extractComments(moveNode);

      expect(comments.size).toBe(3);      const firstMoveComments = comments.get(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
      );
      expect(firstMoveComments).toBeDefined();
      expect(firstMoveComments && firstMoveComments[0].comment).toBe("First move comment");

      const secondMoveComments = comments.get(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
      );
      expect(secondMoveComments).toBeDefined();
      expect(secondMoveComments && secondMoveComments[0].comment).toBe("Response comment");

      const thirdMoveComments = comments.get(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
      );
      expect(thirdMoveComments).toBeDefined();
      expect(thirdMoveComments && thirdMoveComments[0].comment).toBe("Third move comment");
    });
  });  describe("migrateAllRepertoireComments", () => {
    // Save original console.log
    const originalConsoleLog = console.log;
    
    beforeEach(() => {
      // Mock console.log to prevent test output cluttering
      console.log = jest.fn();
    });
    
    afterEach(() => {
      // Restore original console.log
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

      expect(mockPositionsUpdateOne).toHaveBeenCalledWith(
        { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
        {
          $set: {
            comment: "Repertoire 2 comment",
            updatedAt: expect.any(Date),
          },
          $setOnInsert: {
            createdAt: expect.any(Date),
          },
        },
        { upsert: true }
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

      expect(mockPositionsUpdateOne).toHaveBeenCalledWith(
        { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
        {
          $set: {
            comment:
              "This is a much longer comment that should be selected by the keep_longest strategy",
            updatedAt: expect.any(Date),
          },
          $setOnInsert: {
            createdAt: expect.any(Date),
          },
        },
        { upsert: true }
      );
    });
    it("should migrate all comments using merge strategy", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      const result = await migrateAllRepertoireComments("merge");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockPositionsUpdateOne).toHaveBeenCalledWith(
        { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
        {
          $set: {
            comment: "Repertoire 1 comment\n\nRepertoire 2 comment",
            updatedAt: expect.any(Date),
          },
          $setOnInsert: {
            createdAt: expect.any(Date),
          },
        },
        { upsert: true }
      );
    });
    it("should handle existing position comments during migration", async () => {
      mockRepertoiresToArray.mockResolvedValue(mockRepertoires);

      mockPositionsFindOne.mockResolvedValue({
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        comment: "Existing position comment",
        createdAt: new Date("2022-01-01"),
        updatedAt: new Date("2022-01-01"),
      });

      const result = await migrateAllRepertoireComments("merge");

      expect(result.processedRepertoires).toBe(2);
      expect(result.migratedComments).toBe(1);
      expect(result.conflicts).toBe(1);

      expect(mockPositionsUpdateOne).toHaveBeenCalledWith(
        { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
        {
          $set: {
            comment:
              "Existing position comment\n\nRepertoire 1 comment\n\nRepertoire 2 comment",
            updatedAt: expect.any(Date),
          },
          $setOnInsert: {
            createdAt: expect.any(Date),
          },
        },
        { upsert: true }
      );

      mockPositionsFindOne.mockResolvedValue(null);
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

      expect(mockPositionsUpdateOne).toHaveBeenCalledWith(
        { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
        {
          $set: {
            comment: "Repertoire 1 comment",
            updatedAt: expect.any(Date),
          },
          $setOnInsert: {
            createdAt: expect.any(Date),
          },
        },
        { upsert: true }
      );
    });
  });
  describe("getPositionComment", () => {
    it("should return null if no position is found", async () => {
      mockPositionsFindOne.mockResolvedValue(null);

      const comment = await getPositionComment("some-fen-position");

      expect(comment).toBeNull();
      expect(mockPositionsFindOne).toHaveBeenCalledWith({
        fen: "some-fen-position",
      });
    });

    it("should return the comment if position is found", async () => {
      mockPositionsFindOne.mockResolvedValue({
        fen: "some-fen-position",
        comment: "This is a test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const comment = await getPositionComment("some-fen-position");

      expect(comment).toBe("This is a test comment");
      expect(mockPositionsFindOne).toHaveBeenCalledWith({
        fen: "some-fen-position",
      });
    });
  });
});
