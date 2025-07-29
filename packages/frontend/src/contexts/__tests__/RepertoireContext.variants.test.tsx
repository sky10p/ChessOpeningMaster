import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Move } from "chess.js";
import { MemoryRouter } from "react-router-dom";
import {
  RepertoireContextProvider,
  useRepertoireContext,
} from "../RepertoireContext";
import { AlertContextProvider } from "../AlertContext";
import { DialogContextProvider } from "../DialogContext";
import { HeaderContextProvider } from "../HeaderContext";
import { BoardOrientation, IMoveNode } from "@chess-opening-master/common";

jest.mock("../../repository/positions/positions");
jest.mock("../../repository/repertoires/repertoires");

import {
  getPositionComment,
  updatePositionComment,
  getCommentsByFens,
} from "../../repository/positions/positions";
import { putRepertoire } from "../../repository/repertoires/repertoires";

const mockGetPositionComment = getPositionComment as jest.MockedFunction<
  typeof getPositionComment
>;
const mockUpdatePositionComment = updatePositionComment as jest.MockedFunction<
  typeof updatePositionComment
>;
const mockGetCommentsByFens = getCommentsByFens as jest.MockedFunction<
  typeof getCommentsByFens
>;
const mockPutRepertoire = putRepertoire as jest.MockedFunction<
  typeof putRepertoire
>;

const createMockMove = (san: string, lan?: string): Move => ({
  san,
  from: "e2",
  to: "e4",
  piece: "p",
  color: "w",
  flags: "n",
  lan: lan || `${san.toLowerCase()}`,
  before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
});

const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  initialEntries?: string[] 
}> = ({ children, initialEntries = ['/'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AlertContextProvider>
      <DialogContextProvider>
        <HeaderContextProvider>{children}</HeaderContextProvider>
      </DialogContextProvider>
    </AlertContextProvider>
  </MemoryRouter>
);

const createRepertoireProvider = (
  orientation: BoardOrientation = "white",
  initialMoves?: IMoveNode,
  initialEntries?: string[]
) => {
  const Component: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper initialEntries={initialEntries}>
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

describe("RepertoireContext - Enhanced Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPositionComment.mockResolvedValue("");
    mockUpdatePositionComment.mockResolvedValue();
    mockGetCommentsByFens.mockResolvedValue({});
    mockPutRepertoire.mockResolvedValue({});
  });

  describe("Move operations with enhanced variant handling", () => {
    it("should call updateVariants when going to a move", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      expect(result.current.variants).toBeDefined();
      expect(result.current.currentMoveNode.getMove().san).toBe("e4");

      act(() => {
        result.current.goToMove(result.current.moveHistory);
      });

      expect(result.current.currentMoveNode).toBe(result.current.moveHistory);
    });

    it("should handle deleteMove with variant updates", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move1 = createMockMove("e4", "e2e4");
        result.current.addMove(move1);
      });

      await act(async () => {
        const move2 = createMockMove("e5", "e7e5");
        result.current.addMove(move2);
      });

      const currentMove = result.current.currentMoveNode;
      expect(currentMove.parent).not.toBeNull();

      if (currentMove.parent) {
        act(() => {
          result.current.deleteMove(currentMove);
        });

        expect(result.current.currentMoveNode).toBe(currentMove.parent);
      }
    });

    it("should handle addMove with proper variant selection", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      expect(result.current.currentMoveNode.getMove().san).toBe("e4");
      expect(result.current.variants.length).toBeGreaterThan(0);
      expect(result.current.selectedVariant).not.toBeNull();
    });

    it("should update variants when using prev navigation", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      expect(result.current.hasPrev()).toBe(true);

      act(() => {
        result.current.prev();
      });

      expect(result.current.currentMoveNode.parent).toBeNull();
      expect(result.current.variants).toBeDefined();
    });
  });

  describe("Variant selection logic", () => {
    it("should maintain selectedVariant state during operations", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const initialVariants = result.current.variants;
      const initialSelected = result.current.selectedVariant;

      act(() => {
        result.current.setSelectedVariant(initialSelected);
      });

      expect(result.current.selectedVariant).toBe(initialSelected);
      expect(result.current.variants.length).toBe(initialVariants.length);
    });

    it("should handle setSelectedVariant correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const variants = result.current.variants;
      if (variants.length > 0) {
        act(() => {
          result.current.setSelectedVariant(variants[0]);
        });

        expect(result.current.selectedVariant).toBe(variants[0]);
      }

      act(() => {
        result.current.setSelectedVariant(null);
      });

      expect(result.current.selectedVariant).toBeNull();
    });
  });

  describe("Navigation methods", () => {
    it("should handle nextFollowingVariant correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      act(() => {
        result.current.prev();
      });

      expect(result.current.hasNext()).toBe(true);

      act(() => {
        result.current.nextFollowingVariant();
      });

      expect(result.current.currentMoveNode.getMove().san).toBe("e4");
    });

    it("should handle next method when no children exist", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      expect(result.current.hasNext()).toBe(false);

      act(() => {
        result.current.next();
      });

      expect(result.current.currentMoveNode.parent).toBeNull();
    });
  });

  describe("Board state management", () => {
    it("should handle board rotation correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      expect(result.current.orientation).toBe("white");

      act(() => {
        result.current.rotateBoard();
      });

      expect(result.current.orientation).toBe("black");

      act(() => {
        result.current.rotateBoard();
      });

      expect(result.current.orientation).toBe("white");
    });

    it("should initialize board correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      act(() => {
        result.current.initBoard();
      });

      expect(result.current.currentMoveNode).toBe(result.current.moveHistory);
      expect(result.current.chess.fen()).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    });
  });

  describe("Move name changes", () => {
    it("should handle changeNameMove correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const currentMove = result.current.currentMoveNode;
      
      act(() => {
        result.current.changeNameMove(currentMove, "Opening Move");
      });

      expect(currentMove.variantName).toBe("Opening Move");

      act(() => {
        result.current.changeNameMove(currentMove, "");
      });

      expect(currentMove.variantName).toBeUndefined();
    });
  });

  describe("Auto-save functionality", () => {
    it("should trigger save when changes are made", async () => {
      jest.useFakeTimers();
      
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockPutRepertoire).toHaveBeenCalled();
      }, { timeout: 1000 });

      jest.useRealTimers();
    });
  });

  describe("PGN generation", () => {
    it("should generate PGN correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const pgn = await result.current.getPgn();
      expect(typeof pgn).toBe("string");
      expect(pgn.length).toBeGreaterThan(0);
    });
  });

  describe("Context provider properties", () => {
    it("should expose all required context properties", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      expect(result.current.chess).toBeDefined();
      expect(result.current.orientation).toBe("white");
      expect(result.current.repertoireId).toBe("test-repertoire-id");
      expect(result.current.repertoireName).toBe("Test Repertoire");
      expect(result.current.moveHistory).toBeDefined();
      expect(result.current.currentMoveNode).toBeDefined();
      expect(result.current.variants).toBeDefined();
      expect(result.current.selectedVariant).toBeDefined();
      expect(result.current.comment).toBeDefined();

      expect(typeof result.current.initBoard).toBe("function");
      expect(typeof result.current.setChess).toBe("function");
      expect(typeof result.current.rotateBoard).toBe("function");
      expect(typeof result.current.next).toBe("function");
      expect(typeof result.current.nextFollowingVariant).toBe("function");
      expect(typeof result.current.prev).toBe("function");
      expect(typeof result.current.goToMove).toBe("function");
      expect(typeof result.current.changeNameMove).toBe("function");
      expect(typeof result.current.deleteMove).toBe("function");
      expect(typeof result.current.hasNext).toBe("function");
      expect(typeof result.current.hasPrev).toBe("function");
      expect(typeof result.current.addMove).toBe("function");
      expect(typeof result.current.updateComment).toBe("function");
      expect(typeof result.current.saveRepertory).toBe("function");
      expect(typeof result.current.getPgn).toBe("function");
      expect(typeof result.current.updateRepertoire).toBe("function");
      expect(typeof result.current.setSelectedVariant).toBe("function");
    });
  });
});
