import { IMoveNode } from "@chess-opening-master/common";
import { Chess } from "chess.js";
import { getOpeningFen } from "./getOpeningFen";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const createNode = (
  id: string,
  san?: string,
  variantName?: string,
  children: IMoveNode[] = []
): IMoveNode => ({
  id,
  move: san
    ? ({
        san,
      } as never)
    : null,
  children,
  variantName,
});

describe("getOpeningFen", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns START_FEN for the root opening", () => {
    const tree = createNode("root", undefined, "Starting Position");

    expect(getOpeningFen(tree, "Starting Position")).toBe(START_FEN);
  });

  it("returns expected FEN for opening nodes reached through different branches", () => {
    const sicilian = createNode("c5", "c5", "Sicilian Defense");
    const openGame = createNode("e5", "e5", "Open Game");
    const kingsPawn = createNode("e4", "e4", "King's Pawn", [openGame, sicilian]);
    const tree = createNode("root", undefined, "Starting Position", [kingsPawn]);

    expect(getOpeningFen(tree, "King's Pawn")).toBe(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
    );
    expect(getOpeningFen(tree, "Open Game")).toBe(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
    );
    expect(getOpeningFen(tree, "Sicilian Defense")).toBe(
      "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
    );
  });

  it("falls back to START_FEN when opening is not found", () => {
    const tree = createNode("root", undefined, "Starting Position", [
      createNode("e4", "e4", "King's Pawn"),
    ]);

    expect(getOpeningFen(tree, "French Defense")).toBe(START_FEN);
  });

  it("falls back to START_FEN for a tree without matching variant names", () => {
    const tree = createNode("root", undefined, undefined, [
      createNode("e4", "e4"),
      createNode("d4", "d4"),
    ]);

    expect(getOpeningFen(tree, "Any Opening")).toBe(START_FEN);
  });

  it("falls back to START_FEN for an empty move tree", () => {
    const tree = createNode("root");

    expect(getOpeningFen(tree, "Any Opening")).toBe(START_FEN);
  });

  it("falls back to START_FEN when chess move resolution throws", () => {
    const moveSpy = jest
      .spyOn(Chess.prototype, "move")
      .mockImplementation(() => {
        throw new Error("move failed");
      });

    const tree = createNode("root", undefined, "Starting Position", [
      createNode("e4", "e4", "King's Pawn"),
    ]);

    expect(getOpeningFen(tree, "King's Pawn")).toBe(START_FEN);
    expect(moveSpy).toHaveBeenCalled();
  });
});
