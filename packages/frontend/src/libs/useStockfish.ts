import { useState, useEffect } from "react";
import { onStockfishMessage, postMessageToStockfish, removeStockfishMessage } from "../workers/stockfishWorker";

interface Line {
  evaluation: number;
  moves: string[];
}

export type StockfishModel = "stockfish-single" | "stockfish";

const useStockfish = (
  fen: string,
  numLines: number,
): Line[] => {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {

      const message = event.data;

      const sideToMove = fen.split(" ")[1];

      if (message.startsWith("info")) {
        const match = message.match(
          /multipv\s(\d+).*score\s(cp|mate)\s(-?\d+).*pv\s(.+)/
        );
        if (match) {
          const [, pvNumber, scoreType, scoreValue, pvMoves] = match;
          const evaluation =
            scoreType === "cp"
              ? parseInt(scoreValue, 10) / 100
              : parseInt(scoreValue, 10) * 100;
          const adjustedEval = sideToMove === "b" ? -evaluation : evaluation;
          const moves = pvMoves.split(" ");

          setLines((prevLines) => {
            const newLines = [...prevLines];
            newLines[parseInt(pvNumber, 10) - 1] = { evaluation: adjustedEval, moves };
            return newLines;
          });
        }
      }
    };

    onStockfishMessage(handleMessage);
    postMessageToStockfish("uci");
    postMessageToStockfish("ucinewgame");
    postMessageToStockfish(`position fen ${fen}`);
    postMessageToStockfish(`setoption name MultiPV value ${numLines}`);
    postMessageToStockfish("go depth 20");

    return () => {
      removeStockfishMessage();
    };
  }, [fen, numLines]);

  return lines;
};

export default useStockfish;
