import { getPositionComment, updatePositionComment } from "./positions";
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
});
