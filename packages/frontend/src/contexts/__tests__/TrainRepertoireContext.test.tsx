import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MoveVariantNode } from "../../models/VariantNode";
import { Variant } from "../../models/chess.models";
import {
  TrainRepertoireContextProvider,
  useTrainRepertoireContext,
} from "../TrainRepertoireContext";
import * as trainRepertoireContextUtils from "../TrainRepertoireContext.utils";

jest.mock("../RepertoireContext", () => ({
  useRepertoireContext: jest.fn(),
}));

jest.mock("../../repository/repertoires/trainVariants.tsx", () => ({
  getVariantMistakes: jest.fn(async () => []),
  getTrainVariantInfo: jest.fn(async () => []),
  saveVariantMistakeReview: jest.fn(async () => ({})),
  saveVariantReview: jest.fn(async () => ({})),
}));

import { useRepertoireContext } from "../RepertoireContext";

const mockedUseRepertoireContext = useRepertoireContext as jest.Mock;

const createMoveNode = (
  id: string,
  position: number,
  color: "w" | "b",
  from: string,
  to: string,
  san: string
) => {
  const node = new MoveVariantNode();
  node.id = id;
  node.position = position;
  node.move = {
    color,
    piece: "p",
    from,
    to,
    san,
    lan: `${from}${to}`,
    flags: "n",
    before: "fen-before",
    after: "fen-after",
  } as never;
  return node;
};

const createVariant = (name: string, moves: MoveVariantNode[]): Variant => ({
  name,
  fullName: `Opening: ${name}`,
  differentMoves: "",
  moves,
});

describe("TrainRepertoireContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("autoplays only one opponent move after a user move in standard mode", async () => {
    const rootNode = new MoveVariantNode();
    rootNode.id = "root";
    rootNode.position = 0;
    rootNode.move = null;

    const e4 = createMoveNode("e4", 1, "w", "e2", "e4", "e4");
    const e5 = createMoveNode("e5", 2, "b", "e7", "e5", "e5");
    const nf3 = createMoveNode("nf3", 3, "w", "g1", "f3", "Nf3");
    const d4 = createMoveNode("d4", 1, "w", "d2", "d4", "d4");
    const d5 = createMoveNode("d5", 2, "b", "d7", "d5", "d5");
    const c4 = createMoveNode("c4", 3, "w", "c2", "c4", "c4");

    const variants: Variant[] = [
      createVariant("Line A", [e4, e5, nf3]),
      createVariant("Line B", [d4, d5, c4]),
    ];

    const moveCalls: string[] = [];
    let triggerUserMove: ((node: MoveVariantNode) => void) | null = null;
    const stableChess = { fen: () => "start-fen" };

    mockedUseRepertoireContext.mockImplementation(() => {
      const [currentMoveNode, setCurrentMoveNode] = React.useState(rootNode);

      const goToMove = (node: MoveVariantNode) => {
        moveCalls.push(node.id);
        setCurrentMoveNode(node);
      };

      triggerUserMove = goToMove;

      return {
        repertoireId: "rep-1",
        orientation: "white",
        chess: stableChess,
        currentMoveNode,
        goToMove,
        initBoard: () => setCurrentMoveNode(rootNode),
        variants,
      };
    });

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <MemoryRouter>
        <TrainRepertoireContextProvider>{children}</TrainRepertoireContextProvider>
      </MemoryRouter>
    );

    renderHook(() => useTrainRepertoireContext(), { wrapper });

    expect(triggerUserMove).not.toBeNull();

    act(() => {
      triggerUserMove?.(e4);
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(moveCalls).toEqual(["e4", "e5"]);
  });

  it("does not rebuild train variants when no discarded variants need reset", async () => {
    const rootNode = new MoveVariantNode();
    rootNode.id = "root";
    rootNode.position = 0;
    rootNode.move = null;

    const e4 = createMoveNode("e4", 1, "w", "e2", "e4", "e4");
    const e5 = createMoveNode("e5", 2, "b", "e7", "e5", "e5");
    const nf3 = createMoveNode("nf3", 3, "w", "g1", "f3", "Nf3");
    const variants: Variant[] = [createVariant("Line A", [e4, e5, nf3])];
    const stableChess = { fen: () => "start-fen" };
    const initBoardMock = jest.fn();
    const allowedMovesSpy = jest
      .spyOn(trainRepertoireContextUtils, "getAllowedMovesFromTrainVariants")
      .mockReturnValue([]);

    mockedUseRepertoireContext.mockImplementation(() => {
      const [currentMoveNode, setCurrentMoveNode] = React.useState(rootNode);

      const initBoard = () => {
        initBoardMock();
        setCurrentMoveNode(rootNode);
      };

      return {
        repertoireId: "rep-1",
        orientation: "white",
        chess: stableChess,
        currentMoveNode,
        goToMove: jest.fn(),
        initBoard,
        variants,
      };
    });

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <MemoryRouter>
        <TrainRepertoireContextProvider>{children}</TrainRepertoireContextProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useTrainRepertoireContext(), {
      wrapper,
    });

    const initialTrainVariants = result.current.trainVariants;

    await waitFor(() => {
      expect(initBoardMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.allowedMoves).toHaveLength(0);
    expect(result.current.trainVariants).toBe(initialTrainVariants);
    expect(result.current.trainVariants[0]?.state).toBe("inProgress");
    expect(initBoardMock).toHaveBeenCalledTimes(1);
  });

  it("restores discarded variants after a dead-end reset", async () => {
    const rootNode = new MoveVariantNode();
    rootNode.id = "root";
    rootNode.position = 0;
    rootNode.move = null;

    const e4 = createMoveNode("e4", 1, "w", "e2", "e4", "e4");
    const e5 = createMoveNode("e5", 2, "b", "e7", "e5", "e5");
    const nf3 = createMoveNode("nf3", 3, "w", "g1", "f3", "Nf3");
    const wrongMove = createMoveNode("d4", 1, "w", "d2", "d4", "d4");
    const variants: Variant[] = [createVariant("Line A", [e4, e5, nf3])];

    let triggerMove: ((node: MoveVariantNode) => void) | null = null;
    const stableChess = { fen: () => "start-fen" };
    const initBoardMock = jest.fn();

    mockedUseRepertoireContext.mockImplementation(() => {
      const [currentMoveNode, setCurrentMoveNode] = React.useState(rootNode);

      const goToMove = (node: MoveVariantNode) => {
        setCurrentMoveNode(node);
      };

      const initBoard = () => {
        initBoardMock();
        setCurrentMoveNode(rootNode);
      };

      triggerMove = goToMove;

      return {
        repertoireId: "rep-1",
        orientation: "white",
        chess: stableChess,
        currentMoveNode,
        goToMove,
        initBoard,
        variants,
      };
    });

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <MemoryRouter>
        <TrainRepertoireContextProvider>{children}</TrainRepertoireContextProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useTrainRepertoireContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.allowedMoves.map((move) => move.id)).toEqual(["e4"]);
    });

    const initialResetCount = initBoardMock.mock.calls.length;

    act(() => {
      triggerMove?.(wrongMove);
    });

    await waitFor(() => {
      expect(result.current.allowedMoves.map((move) => move.id)).toEqual(["e4"]);
    });

    expect(result.current.trainVariants[0]?.state).toBe("inProgress");
    expect(initBoardMock.mock.calls.length).toBeGreaterThan(initialResetCount);
  });
});
