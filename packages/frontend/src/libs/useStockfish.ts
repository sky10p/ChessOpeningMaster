import { useState, useEffect } from "react";
import { onStockfishMessage, postMessageToStockfish, removeStockfishMessage } from "../workers/stockfishWorker";
import { StockfishData, Line } from "./stockfish.models";



export type StockfishModel = "stockfish-single" | "stockfish";

const MAX_DEPTH = 31;

const useStockfish = (
  fen: string,
  numLines: number,
  enabled = true
): StockfishData => {
  const [lines, setLines] = useState<Line[]>([]);
  const [depth, setDepth] = useState<number>(0);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Reset state variables
    setLines([]);
    setDepth(0);
    setTime(0);

    const handleMessage = (event: MessageEvent) => {

      const message = event.data;
      console.log(message);

      const sideToMove = fen.split(" ")[1];

      if (message.startsWith("info")) {
        const match = message.match(
          /info\sdepth\s(\d+).*seldepth\s(\d+).*multipv\s(\d+).*score\s(cp|mate)\s(-?\d+)(?:\supperbound|\slowerbound)?.*time\s(\d+).*pv\s(.+)/
        );
        if (match) {
          const [, depthValue, , pvNumber, scoreType, scoreValue, timeValue, pvMoves] = match;
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
          setDepth(parseInt(depthValue, 10));
          setTime(parseInt(timeValue, 10) / 1000); // Convert milliseconds to seconds
        }
      }
    };

    onStockfishMessage(handleMessage);
    postMessageToStockfish("uci");
    postMessageToStockfish("ucinewgame");
    postMessageToStockfish(`position fen ${fen}`);
    postMessageToStockfish(`setoption name MultiPV value ${numLines}`);
    postMessageToStockfish(`go depth ${MAX_DEPTH}`);

    return () => {
      removeStockfishMessage();
    };
  }, [fen, numLines, enabled]);

  return { lines, depth, time, maxDepth: MAX_DEPTH };
};

export default useStockfish;
