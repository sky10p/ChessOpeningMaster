import { Request, Response } from "express";
import { 
  getComment, 
  updateComment, 
  getCommentsByFens 
} from "../positionsController";
import * as positionCommentService from "../../services/positionCommentService";

jest.mock("../../services/positionCommentService");

const mockGetPositionComment = positionCommentService.getPositionComment as jest.MockedFunction<typeof positionCommentService.getPositionComment>;
const mockUpdatePositionComment = positionCommentService.updatePositionComment as jest.MockedFunction<typeof positionCommentService.updatePositionComment>;
const mockGetPositionCommentsByFens = positionCommentService.getPositionCommentsByFens as jest.MockedFunction<typeof positionCommentService.getPositionCommentsByFens>;

describe("positionsController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = { userId: "user-1" };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe("getComment", () => {
    it("should return comment when position is found", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const testComment = "Test comment";
      
      mockRequest.params = { fen: testFen };
      mockGetPositionComment.mockResolvedValue(testComment);

      await getComment(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionComment).toHaveBeenCalledWith("user-1", testFen);
      expect(mockJson).toHaveBeenCalledWith({ fen: testFen, comment: testComment });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it("should return 404 when position is not found", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      
      mockRequest.params = { fen: testFen };
      mockGetPositionComment.mockResolvedValue(null);

      await getComment(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionComment).toHaveBeenCalledWith("user-1", testFen);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "No comment found for position" });
    });

    it("should return 400 when FEN is missing", async () => {
      mockRequest.params = {};

      await getComment(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionComment).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "FEN position is required" });
    });

    it("should return 500 when service throws error", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      
      mockRequest.params = { fen: testFen };
      mockGetPositionComment.mockRejectedValue(new Error("Database error"));

      await getComment(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionComment).toHaveBeenCalledWith("user-1", testFen);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Failed to fetch position comment" });
    });
  });

  describe("updateComment", () => {
    it("should update comment successfully", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const testComment = "Updated comment";
      
      mockRequest.params = { fen: testFen };
      mockRequest.body = { comment: testComment };
      mockUpdatePositionComment.mockResolvedValue();

      await updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockUpdatePositionComment).toHaveBeenCalledWith("user-1", testFen, testComment);
      expect(mockJson).toHaveBeenCalledWith({ 
        fen: testFen, 
        comment: testComment, 
        message: "Comment updated successfully" 
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it("should return 400 when FEN is missing", async () => {
      mockRequest.params = {};
      mockRequest.body = { comment: "Test comment" };

      await updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockUpdatePositionComment).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "FEN position is required" });
    });

    it("should return 400 when comment is undefined", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      
      mockRequest.params = { fen: testFen };
      mockRequest.body = {};

      await updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockUpdatePositionComment).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "Comment is required" });
    });

    it("should allow empty string comment", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      
      mockRequest.params = { fen: testFen };
      mockRequest.body = { comment: "" };
      mockUpdatePositionComment.mockResolvedValue();

      await updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockUpdatePositionComment).toHaveBeenCalledWith("user-1", testFen, "");
      expect(mockJson).toHaveBeenCalledWith({ 
        fen: testFen, 
        comment: "", 
        message: "Comment updated successfully" 
      });
    });

    it("should return 500 when service throws error", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const testComment = "Test comment";
      
      mockRequest.params = { fen: testFen };
      mockRequest.body = { comment: testComment };
      mockUpdatePositionComment.mockRejectedValue(new Error("Database error"));

      await updateComment(mockRequest as Request, mockResponse as Response);

      expect(mockUpdatePositionComment).toHaveBeenCalledWith("user-1", testFen, testComment);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Failed to update position comment" });
    });
  });

  describe("getCommentsByFens", () => {
    it("should return comments for multiple FENs", async () => {
      const testFens = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
      ];
      const mockCommentsMap = {
        [testFens[0]]: "Starting position",
        [testFens[1]]: "After e4"
      };
      
      mockRequest.query = { fens: testFens };
      mockGetPositionCommentsByFens.mockResolvedValue(mockCommentsMap);

      await getCommentsByFens(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionCommentsByFens).toHaveBeenCalledWith("user-1", testFens);
      expect(mockJson).toHaveBeenCalledWith(mockCommentsMap);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it("should handle single FEN in query", async () => {
      const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const mockCommentsMap = {
        [testFen]: "Starting position"
      };
      
      mockRequest.query = { fens: testFen };
      mockGetPositionCommentsByFens.mockResolvedValue(mockCommentsMap);

      await getCommentsByFens(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionCommentsByFens).toHaveBeenCalledWith("user-1", [testFen]);
      expect(mockJson).toHaveBeenCalledWith(mockCommentsMap);
    });

    it("should return 400 when fens query parameter is missing", async () => {
      mockRequest.query = {};

      await getCommentsByFens(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionCommentsByFens).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "FENs query parameter is required" });
    });

    it("should return empty object when no comments found", async () => {
      const testFens = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
      ];
      
      mockRequest.query = { fens: testFens };
      mockGetPositionCommentsByFens.mockResolvedValue({});

      await getCommentsByFens(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionCommentsByFens).toHaveBeenCalledWith("user-1", testFens);
      expect(mockJson).toHaveBeenCalledWith({});
    });

    it("should return 500 when service throws error", async () => {
      const testFens = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      ];
      
      mockRequest.query = { fens: testFens };
      mockGetPositionCommentsByFens.mockRejectedValue(new Error("Database error"));

      await getCommentsByFens(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionCommentsByFens).toHaveBeenCalledWith("user-1", testFens);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Failed to fetch position comments" });
    });

    it("should handle empty fens array", async () => {
      mockRequest.query = { fens: [] };
      mockGetPositionCommentsByFens.mockResolvedValue({});

      await getCommentsByFens(mockRequest as Request, mockResponse as Response);

      expect(mockGetPositionCommentsByFens).toHaveBeenCalledWith("user-1", []);
      expect(mockJson).toHaveBeenCalledWith({});
    });
  });
});
