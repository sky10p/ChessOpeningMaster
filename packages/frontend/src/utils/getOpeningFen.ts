import { Chess } from "chess.js";
import { IMoveNode } from "@chess-opening-master/common";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function findOpeningFen(
  node: IMoveNode,
  chess: Chess,
  openingName: string
): string | null {
  if (node.variantName === openingName) {
    return chess.fen();
  }
  for (const child of node.children) {
    if (!child.move) continue;
    const moveSan = child.move.san;
    try {
      chess.move(moveSan);
    } catch {
      continue;
    }

    let result: string | null = null;
    let undoFailed = false;
    try {
      result = findOpeningFen(child, chess, openingName);
    } finally {
      try {
        chess.undo();
      } catch {
        undoFailed = true;
      }
    }

    if (undoFailed) return null;

    if (result !== null) return result;
  }
  return null;
}

export const getOpeningFen = (
  moveNodes: IMoveNode,
  openingName: string
): string => {
  try {
    const chess = new Chess();
    return findOpeningFen(moveNodes, chess, openingName) ?? START_FEN;
  } catch {
    return START_FEN;
  }
};
