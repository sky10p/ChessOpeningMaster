import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Chess, Move } from "chess.js";
import { MemoryRouter } from "react-router-dom";
import {
  RepertoireContextProvider,
  useRepertoireContext,
} from "../RepertoireContext";
import { AlertContextProvider } from "../AlertContext";
import { DialogContextProvider } from "../DialogContext";
import { HeaderContextProvider } from "../HeaderContext";
import {
  BoardOrientation,
  IMoveNode,
  MoveVariantNode,
} from "@chess-opening-master/common";

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

const createMove = (
  san: string,
  previousSans: string[] = [],
  lan?: string
): Move => {
  const chess = new Chess();
  previousSans.forEach((moveSan) => {
    chess.move(moveSan);
  });
  const move = chess.move(san);
  if (!move) {
    throw new Error("Invalid move");
  }
  if (lan) {
    move.lan = lan;
  }
  return move;
};

const createInitialMoves = (): IMoveNode => ({
  id: "initial",
  move: null,
  children: [
    {
      id: "e2e4",
      move: createMove("e4", [], "e2e4"),
      variantName: "Apertura Española",
      children: [
        {
          id: "e7e5",
          move: createMove("e5", ["e4"], "e7e5"),
          children: [],
        },
      ],
    },
    {
      id: "d2d4",
      move: createMove("d4", [], "d2d4"),
      variantName: "Gambito de Dama",
      children: [
        {
          id: "d7d5",
          move: createMove("d5", ["d4"], "d7d5"),
          children: [],
        },
      ],
    },
  ],
});

const findRootChildByVariantName = (
  root: MoveVariantNode,
  variantName: string
) => root.children.find((child) => child.variantName === variantName);

const requireMoveNode = (node: MoveVariantNode | undefined) => {
  if (!node) {
    throw new Error("Move node not found");
  }
  return node;
};

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
    
    // Suppress act warnings for async useEffect operations
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Warning: An update to RepertoireContextProvider inside a test was not wrapped in act')) {
        return;
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Move operations with enhanced variant handling", () => {
    it("should call updateVariants when going to a move", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      expect(result.current.variants).toBeDefined();
      expect(result.current.currentMoveNode.getMove().san).toBe("e4");

      await act(async () => {
        result.current.goToMove(result.current.moveHistory);
      });

      expect(result.current.currentMoveNode).toBe(result.current.moveHistory);
    });

    it("should handle deleteMove with variant updates", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
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
        await act(async () => {
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      expect(result.current.hasPrev()).toBe(true);

      await act(async () => {
        result.current.prev();
      });

      expect(result.current.currentMoveNode.parent).toBeNull();
      expect(result.current.variants).toBeDefined();
    });
  });

  describe("Variant selection logic", () => {
    it("should keep selected variant when move is compatible", async () => {
      const Provider = createRepertoireProvider(
        "white",
        createInitialMoves()
      );

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      const root = result.current.moveHistory;
      const e4Node = requireMoveNode(
        findRootChildByVariantName(root, "Apertura Española")
      );
      const e5Node = requireMoveNode(e4Node.children[0]);

      await act(async () => {
        result.current.goToMove(e4Node);
      });

      const selectedBefore = result.current.selectedVariant?.name;

      await act(async () => {
        result.current.goToMove(e5Node);
      });

      expect(result.current.selectedVariant?.name).toBe(selectedBefore);
      expect(result.current.selectedVariant?.name).toBe("Apertura Española");
    });

    it("should switch to first compatible variant when move is incompatible", async () => {
      const Provider = createRepertoireProvider(
        "white",
        createInitialMoves()
      );

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      const root = result.current.moveHistory;
      const e4Node = requireMoveNode(
        findRootChildByVariantName(root, "Apertura Española")
      );
      const d4Node = requireMoveNode(
        findRootChildByVariantName(root, "Gambito de Dama")
      );

      await act(async () => {
        result.current.goToMove(e4Node);
      });

      expect(result.current.selectedVariant?.name).toBe("Apertura Española");

      await act(async () => {
        result.current.goToMove(d4Node);
      });

      expect(result.current.selectedVariant?.name).toBe("Gambito de Dama");
    });

    it("should maintain selectedVariant state during operations", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const initialVariants = result.current.variants;
      const initialSelected = result.current.selectedVariant;

      await act(async () => {
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const variants = result.current.variants;
      if (variants.length > 0) {
        await act(async () => {
          result.current.setSelectedVariant(variants[0]);
        });

        expect(result.current.selectedVariant).toBe(variants[0]);
      }

      await act(async () => {
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      await act(async () => {
        result.current.prev();
      });

      expect(result.current.hasNext()).toBe(true);

      await act(async () => {
        result.current.nextFollowingVariant();
      });

      expect(result.current.currentMoveNode.getMove().san).toBe("e4");
    });

    it("should handle next method when no children exist", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      expect(result.current.hasNext()).toBe(false);

      await act(async () => {
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      expect(result.current.orientation).toBe("white");

      await act(async () => {
        result.current.rotateBoard();
      });

      expect(result.current.orientation).toBe("black");

      await act(async () => {
        result.current.rotateBoard();
      });

      expect(result.current.orientation).toBe("white");
    });

    it("should initialize board correctly", async () => {
      const Provider = createRepertoireProvider("white");

      const { result } = renderHook(() => useRepertoireContext(), {
        wrapper: Provider,
      });

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      await act(async () => {
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
      });

      await act(async () => {
        const move = createMockMove("e4", "e2e4");
        result.current.addMove(move);
      });

      const currentMove = result.current.currentMoveNode;
      
      await act(async () => {
        result.current.changeNameMove(currentMove, "Opening Move");
      });

      expect(currentMove.variantName).toBe("Opening Move");

      await act(async () => {
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
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

      // Wait for initial async operations to complete
      await waitFor(() => {
        expect(mockGetPositionComment).toHaveBeenCalled();
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
