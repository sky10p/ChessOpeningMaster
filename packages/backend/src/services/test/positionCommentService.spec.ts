import {
  getPositionComment,
  getPositionCommentsByFens,
} from "../positionCommentService";
import * as mongo from "../../db/mongo";

jest.mock("../../db/mongo");

describe("positionCommentService", () => {
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
    mockRepertoiresToArray.mockResolvedValue([]);

    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });
  describe("getPositionComment", () => {
    it("should return null if no position is found", async () => {
      mockPositionsFindOne.mockResolvedValue(null);

      const comment = await getPositionComment("user-1", "some-fen-position");

      expect(comment).toBeNull();
      expect(mockPositionsFindOne).toHaveBeenCalledWith({
        fen: "some-fen-position",
        userId: "user-1",
      });
    });

    it("should return the comment if position is found", async () => {
      mockPositionsFindOne.mockResolvedValue({
        fen: "some-fen-position",
        comment: "This is a test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const comment = await getPositionComment("user-1", "some-fen-position");

      expect(comment).toBe("This is a test comment");
      expect(mockPositionsFindOne).toHaveBeenCalledWith({
        fen: "some-fen-position",
        userId: "user-1",
      });
    });
  });
  describe("getPositionCommentsByFens", () => {
    it("should return an empty object if no FENs are provided", async () => {
      const comments = await getPositionCommentsByFens("user-1", []);

      expect(comments).toEqual({});
      expect(mockPositionsFind).not.toHaveBeenCalled();
    });

    it("should return comments for the given FENs", async () => {
      const fen1 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const fen2 =
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { fen: fen1, comment: "Comment for FEN 1", updatedAt: new Date() },
          { fen: fen2, comment: "Comment for FEN 2", updatedAt: new Date() },
        ]),
      });

      const comments = await getPositionCommentsByFens("user-1", [fen1, fen2]);

      expect(comments).toEqual({
        [fen1]: "Comment for FEN 1",
        [fen2]: "Comment for FEN 2",
      });
      expect(mockPositionsFind).toHaveBeenCalledWith({
        fen: { $in: [fen1, fen2] },
        userId: "user-1",
      });
    });

    it("should return only positions that have comments", async () => {
      const fen1 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const fen2 =
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
      const fen3 =
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { fen: fen1, comment: "Comment for FEN 1", updatedAt: new Date() },
          { fen: fen2, comment: "", updatedAt: new Date() },
          { fen: fen3, comment: null, updatedAt: new Date() },
        ]),
      });

      const comments = await getPositionCommentsByFens("user-1", [fen1, fen2, fen3]);

      expect(comments).toEqual({
        [fen1]: "Comment for FEN 1",
      });
      expect(mockPositionsFind).toHaveBeenCalledWith({
        fen: { $in: [fen1, fen2, fen3] },
        userId: "user-1",
      });
    });

    it("should handle single FEN", async () => {
      const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      mockPositionsFind.mockReturnValue({
        toArray: jest
          .fn()
          .mockResolvedValue([
            { fen, comment: "Single comment", updatedAt: new Date() },
          ]),
      });

      const comments = await getPositionCommentsByFens("user-1", [fen]);

      expect(comments).toEqual({
        [fen]: "Single comment",
      });
      expect(mockPositionsFind).toHaveBeenCalledWith({
        fen: { $in: [fen] },
        userId: "user-1",
      });
    });

    it("should handle positions with no matches in database", async () => {
      const fen1 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const fen2 =
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

      mockPositionsFind.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const comments = await getPositionCommentsByFens("user-1", [fen1, fen2]);

      expect(comments).toEqual({});
      expect(mockPositionsFind).toHaveBeenCalledWith({
        fen: { $in: [fen1, fen2] },
        userId: "user-1",
      });
    });

    it("should skip early return when array is empty", async () => {
      const comments = await getPositionCommentsByFens("user-1", []);

      expect(comments).toEqual({});
      expect(mockPositionsFind).not.toHaveBeenCalled();
    });
  });
});
