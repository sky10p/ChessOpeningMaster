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
    let moveApplied = false;
    try {
      chess.move(moveSan);
      moveApplied = true;
    } catch {
      continue;
    }

    const result = findOpeningFen(child, chess, openingName);
    if (result !== null) return result;

    if (moveApplied) {
      chess.undo();
    }
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
