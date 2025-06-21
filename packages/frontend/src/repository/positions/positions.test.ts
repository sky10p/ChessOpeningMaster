import { getPositionComment, updatePositionComment, getCommentsByFens } from "./positions";
import { API_URL } from "../constants";

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const createMockResponse = (options: {
  ok: boolean;
  status: number;
  json?: jest.Mock;
}): Partial<Response> => ({
  ok: options.ok,
  status: options.status,
  json: options.json,
});

const createExpectedUrl = (fens: string[]): string => {
  const queryParams = new URLSearchParams();
  fens.forEach(fen => queryParams.append('fens', fen));
  return `${API_URL}/positions/comments?${queryParams.toString()}`;
};

describe("positions repository", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    console.error = jest.fn();
  });

  describe("getPositionComment", () => {
    const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const encodedFen = encodeURIComponent(testFen);
    it("should return comment when position is found", async () => {
      const mockComment = "This is a test comment";
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ comment: mockComment }),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getPositionComment(testFen);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`
      );
      expect(result).toBe(mockComment);
    });

    it("should return null when position is not found (404)", async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 404,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getPositionComment(testFen);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`
      );
      expect(result).toBeNull();
    });

    it("should throw error and return null when response is not ok (non-404)", async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 500,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getPositionComment(testFen);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`
      );
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching position comment:",
        expect.any(Error)
      );
    });

    it("should handle network errors gracefully", async () => {
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValue(networkError);

      const result = await getPositionComment(testFen);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`
      );
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching position comment:",
        networkError
      );
    });

    it("should handle malformed JSON response", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getPositionComment(testFen);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`
      );
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching position comment:",
        expect.any(Error)
      );
    });

    it("should properly encode special characters in FEN", async () => {
      const fenWithSpaces =
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const expectedEncodedFen = encodeURIComponent(fenWithSpaces);

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ comment: "test" }),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await getPositionComment(fenWithSpaces);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${expectedEncodedFen}`
      );
    });

    it("should return null when comment field is missing from response", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getPositionComment(testFen);

      expect(result).toBeUndefined();
    });
  });
  describe("updatePositionComment", () => {
    const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const encodedFen = encodeURIComponent(testFen);
    const testComment = "Updated comment";

    it("should successfully update position comment", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await expect(
        updatePositionComment(testFen, testComment)
      ).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: testComment }),
        }
      );
    });

    it("should throw error when response is not ok", async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 400,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await expect(updatePositionComment(testFen, testComment)).rejects.toThrow(
        "Failed to update position comment"
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`,
        expect.objectContaining({
          method: "PUT",
        })
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error updating position comment:",
        expect.any(Error)
      );
    });

    it("should throw error when response is 404", async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 404,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await expect(updatePositionComment(testFen, testComment)).rejects.toThrow(
        "Failed to update position comment"
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error updating position comment:",
        expect.any(Error)
      );
    });

    it("should throw error when response is 500", async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 500,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await expect(updatePositionComment(testFen, testComment)).rejects.toThrow(
        "Failed to update position comment"
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error updating position comment:",
        expect.any(Error)
      );
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValue(networkError);

      await expect(updatePositionComment(testFen, testComment)).rejects.toThrow(
        "Network error"
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error updating position comment:",
        networkError
      );
    });

    it("should properly encode special characters in FEN", async () => {
      const fenWithSpaces =
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const expectedEncodedFen = encodeURIComponent(fenWithSpaces);

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await updatePositionComment(fenWithSpaces, testComment);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${expectedEncodedFen}`,
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    it("should handle empty comment", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await updatePositionComment(testFen, "");

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`,
        expect.objectContaining({
          body: JSON.stringify({ comment: "" }),
        })
      );
    });

    it("should handle special characters in comment", async () => {
      const specialComment =
        'Comment with "quotes" and \nnewlines\t and émojis 🎯';
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await updatePositionComment(testFen, specialComment);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/positions/${encodedFen}`,
        expect.objectContaining({
          body: JSON.stringify({ comment: specialComment }),
        })
      );
    });

    it("should set correct headers", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await updatePositionComment(testFen, testComment);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });
  });
  describe("getCommentsByFens", () => {    it("should fetch comments for multiple FENs", async () => {
      const fens = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
      ];
      const mockComments = { 
        [fens[0]]: "Comment 1", 
        [fens[1]]: "Comment 2" 
      };
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockComments),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);      const result = await getCommentsByFens(fens);

      const expectedUrl = createExpectedUrl(fens);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockComments);
    });it("should return empty object when no FENs are provided", async () => {
      const result = await getCommentsByFens([]);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });    it("should handle positions with missing comments", async () => {
      const fens = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
      ];
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);      const result = await getCommentsByFens(fens);

      const expectedUrl = createExpectedUrl(fens);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual({});
    });    it("should handle network errors gracefully", async () => {
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValue(networkError);

      const result = await getCommentsByFens([
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      ]);

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching comments by FENs:",
        networkError
      );
    });    it("should handle malformed JSON response", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getCommentsByFens([
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      ]);

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching comments by FENs:",
        expect.any(Error)
      );
    });
  });

  describe("getCommentsByFens", () => {
    const testFens = [
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2"
    ];

    it("should fetch comments for multiple FENs successfully", async () => {
      const mockCommentsMap = {
        [testFens[0]]: "Starting position comment",
        [testFens[1]]: "After e4 comment",
        [testFens[2]]: "After e4 e5 comment"
      };

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockCommentsMap),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);      const result = await getCommentsByFens(testFens);

      expect(mockFetch).toHaveBeenCalledWith(createExpectedUrl(testFens));
      expect(result).toEqual(mockCommentsMap);
    });

    it("should handle single FEN in array", async () => {
      const singleFen = [testFens[0]];
      const mockCommentsMap = {
        [testFens[0]]: "Single position comment"
      };

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockCommentsMap),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);      const result = await getCommentsByFens(singleFen);

      expect(mockFetch).toHaveBeenCalledWith(createExpectedUrl(singleFen));
      expect(result).toEqual(mockCommentsMap);
    });    it("should handle empty FENs array", async () => {
      const result = await getCommentsByFens([]);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("should return empty object when response is not ok", async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 500,
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getCommentsByFens(testFens);

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching position comments:",
        expect.any(Error)
      );
    });    it("should handle network errors gracefully", async () => {
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValue(networkError);

      const result = await getCommentsByFens(testFens);

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching comments by FENs:",
        networkError
      );
    });

    it("should handle partial response with only some FENs having comments", async () => {
      const partialCommentsMap = {
        [testFens[0]]: "Only first position has comment"
      };

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(partialCommentsMap),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getCommentsByFens(testFens);

      expect(result).toEqual(partialCommentsMap);
    });

    it("should properly encode special characters in FENs", async () => {
      const fensWithSpaces = [
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
      ];

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      await getCommentsByFens(fensWithSpaces);      const expectedUrl = createExpectedUrl(fensWithSpaces);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
    });    it("should handle malformed JSON response", async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);

      const result = await getCommentsByFens(testFens);

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching comments by FENs:",
        expect.any(Error)
      );
    });

    it("should handle duplicate FENs in input array", async () => {
      const duplicateFens = [testFens[0], testFens[0], testFens[1]];
      const mockCommentsMap = {
        [testFens[0]]: "Duplicate position comment",
        [testFens[1]]: "Second position comment"
      };

      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockCommentsMap),
      });
      mockFetch.mockResolvedValue(mockResponse as Response);      const result = await getCommentsByFens(duplicateFens);

      const expectedUrl = createExpectedUrl(duplicateFens);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockCommentsMap);
    });
  });
});
