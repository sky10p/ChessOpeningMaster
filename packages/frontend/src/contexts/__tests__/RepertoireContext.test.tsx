import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Move } from "chess.js";
import {
  RepertoireContextProvider,
  useRepertoireContext,
} from "../RepertoireContext";
import { AlertContextProvider } from "../AlertContext";
import { DialogContextProvider } from "../DialogContext";
import { HeaderContextProvider } from "../HeaderContext";
import { BoardOrientation } from "@chess-opening-master/common";

jest.mock("../../repository/positions/positions");
jest.mock("../../repository/repertoires/repertoires");

import {
  getPositionComment,
  updatePositionComment,
} from "../../repository/positions/positions";
import { putRepertoire } from "../../repository/repertoires/repertoires";

const mockGetPositionComment = getPositionComment as jest.MockedFunction<
  typeof getPositionComment
>;
const mockUpdatePositionComment = updatePositionComment as jest.MockedFunction<
  typeof updatePositionComment
>;
const mockPutRepertoire = putRepertoire as jest.MockedFunction<
  typeof putRepertoire
>;

const createMockMove = (san: string): Move => ({
  san,
  from: "e2",
  to: "e4",
  piece: "p",
  color: "w",
  flags: "n",
  lan: "e2e4",
  before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AlertContextProvider>
    <DialogContextProvider>
      <HeaderContextProvider>{children}</HeaderContextProvider>
    </DialogContextProvider>
  </AlertContextProvider>
);

const createRepertoireProvider = (
  orientation: BoardOrientation = "white",
  initialMoves?: undefined
) => {
  const Component: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper>
      <RepertoireContextProvider
        repertoireId="test-repertoire-id"
        repertoireName="Test Repertoire"
        initialOrientation={orientation}
        initialMoves={initialMoves}
        updateRepertoire={jest.fn()}
      >
        {children}
      </RepertoireContextProvider>
    </TestWrapper>
  );
  return Component;
};

describe("RepertoireContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPositionComment.mockResolvedValue("");
    mockUpdatePositionComment.mockResolvedValue();
    mockPutRepertoire.mockResolvedValue({});
  });

  describe("updateComment functionality", () => {
    it("should load comment when component mounts", async () => {
      const initialComment = "Initial position comment";
      mockGetPositionComment.mockResolvedValue(initialComment);

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await waitFor(() => {
        expect(result.current.comment).toBe(initialComment);
      });

      expect(mockGetPositionComment).toHaveBeenCalledWith(
        expect.stringContaining("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
      );
    });
    it("should update comment successfully", async () => {
      const newComment = "This is a test comment";
      mockUpdatePositionComment.mockResolvedValue();

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.comment).toBe("");
      });

      await act(async () => {
        await result.current.updateComment(newComment);
      });

      expect(result.current.comment).toBe(newComment);
      expect(mockUpdatePositionComment).toHaveBeenCalledWith(
        expect.any(String),
        newComment
      );
    });
    it("should update comment with different orientations", async () => {
      const whiteComment = "White perspective comment";
      const blackComment = "Black perspective comment";

      const { result: whiteResult } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider("white"),
      });

      const { result: blackResult } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider("black"),
      });

      // Wait for initial load to complete for both
      await waitFor(() => {
        expect(whiteResult.current.comment).toBe("");
        expect(blackResult.current.comment).toBe("");
      });

      await act(async () => {
        await whiteResult.current.updateComment(whiteComment);
      });

      await act(async () => {
        await blackResult.current.updateComment(blackComment);
      });

      expect(whiteResult.current.comment).toBe(whiteComment);
      expect(blackResult.current.comment).toBe(blackComment);
      expect(mockUpdatePositionComment).toHaveBeenCalledTimes(2);
    });

    it("should handle empty comment updates", async () => {
      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await act(async () => {
        await result.current.updateComment("");
      });

      expect(result.current.comment).toBe("");
      expect(mockUpdatePositionComment).toHaveBeenCalledWith(
        expect.any(String),
        ""
      );
    });

    it("should handle updatePositionComment errors gracefully", async () => {
      const errorMessage = "Network error";
      mockUpdatePositionComment.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await act(async () => {
        await result.current.updateComment("Test comment");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating position comment:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
    it("should reload comment when current move changes", async () => {
      const initialComment = "Starting position";
      const newMoveComment = "After e4";

      // Mock the first call for initial load
      mockGetPositionComment.mockResolvedValue(initialComment);

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await waitFor(() => {
        expect(result.current.comment).toBe(initialComment);
      });

      // Clear previous calls and set up mock for the new position
      mockGetPositionComment.mockClear();
      mockGetPositionComment.mockResolvedValue(newMoveComment);

      const mockMove = createMockMove("e4");

      await act(async () => {
        result.current.addMove(mockMove);
      });

      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalledTimes(1);
        expect(result.current.comment).toBe(newMoveComment);
      });
    });
    it("should reload comment when orientation changes", async () => {
      const whiteComment = "White orientation comment";
      const blackComment = "Black orientation comment";

      // Test white orientation
      mockGetPositionComment.mockResolvedValue(whiteComment);

      const { result, unmount } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider("white"),
      });

      await waitFor(() => {
        expect(result.current.comment).toBe(whiteComment);
      });

      // Unmount first instance and clear mock calls
      unmount();
      mockGetPositionComment.mockClear();
      mockGetPositionComment.mockResolvedValue(blackComment);

      // Test black orientation
      const { result: blackResult } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider("black"),
      });
      await waitFor(() => {
        expect(blackResult.current.comment).toBe(blackComment);
      });

      expect(mockGetPositionComment).toHaveBeenCalled();
    });

    it("should handle getPositionComment errors gracefully", async () => {
      const errorMessage = "Failed to fetch comment";
      mockGetPositionComment.mockRejectedValue(new Error(errorMessage));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await waitFor(() => {
        expect(result.current.comment).toBe("");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading position comment:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle null comment from getPositionComment", async () => {
      mockGetPositionComment.mockResolvedValue(null);

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await waitFor(() => {
        expect(result.current.comment).toBe("");
      });
    });

    it("should set hasChanges when comment is updated", async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await act(async () => {
        await result.current.updateComment("New comment");
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockPutRepertoire).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
    it("should use orientation-aware FEN for comment operations", async () => {
      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider("black"),
      });

      await act(async () => {
        await result.current.updateComment("Black orientation comment");
      });

      expect(mockUpdatePositionComment).toHaveBeenCalledWith(
        expect.any(String),
        "Black orientation comment"
      );
    });

    it("should preserve comment state across chess moves", async () => {
      const initialComment = "Starting comment";
      const updatedComment = "Updated comment";

      mockGetPositionComment.mockResolvedValue(initialComment);

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      await waitFor(() => {
        expect(result.current.comment).toBe(initialComment);
      });
      await act(async () => {
        await result.current.updateComment(updatedComment);
      });

      await waitFor(() => {
        expect(result.current.comment).toBe(updatedComment);
      });

      const mockMove = createMockMove("e4");
      await act(async () => {
        result.current.addMove(mockMove);
      });

      expect(mockGetPositionComment).toHaveBeenCalledTimes(3);
    });
  });

  describe("integration with other context methods", () => {
    it("should maintain comment functionality when going to specific moves", async () => {
      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      const mockMove = createMockMove("e4");

      await act(async () => {
        result.current.addMove(mockMove);
      });

      await act(async () => {
        result.current.goToMove(result.current.moveHistory);
      });

      expect(mockGetPositionComment).toHaveBeenCalled();
    });
    it("should reload comment when using prev/next navigation", async () => {
      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: createRepertoireProvider(),
      });

      const mockMove = createMockMove("e4");

      await act(async () => {
        result.current.addMove(mockMove);
      });
      await act(async () => {
        result.current.prev();
      });

      expect(mockGetPositionComment).toHaveBeenCalledTimes(4);
    });
  });
});
