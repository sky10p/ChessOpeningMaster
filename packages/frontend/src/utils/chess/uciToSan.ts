import { Chess } from "chess.js";

export const uciToSan = (uciMoves: string[], fen: string): string[] => {
  const sanMoves: string[] = [];

  try {
    const chess = new Chess(fen);

    uciMoves.forEach((uciMove) => {
      const from = uciMove.slice(0, 2);
      const to = uciMove.slice(2, 4);
      const promotion = uciMove.slice(4, 5);
      const move = chess.move({ from, to, promotion });
      if (move) {
        sanMoves.push(move.san);
      }
    });
  } catch (e) {
    console.error(e);
  }

  return sanMoves;
};

export const uciLineToSan = (line: string, fen: string): string => {
  const uciMoves = line.split(" ");
  const sanMoves = uciToSan(uciMoves, fen);
  return sanMoves.join(" ");
};
