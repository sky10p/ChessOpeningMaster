import { useState, useEffect } from 'react';


interface Line {
  evaluation: number;
  moves: string[];
}

const useStockfish = (fen: string, numLines: number): Line[] => {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const stockfishWorker = new Worker('/stockfish.worker.js');


    stockfishWorker.postMessage('uci');
    stockfishWorker.postMessage('ucinewgame');
    stockfishWorker.postMessage(`position fen ${fen}`);
    stockfishWorker.postMessage(`setoption name MultiPV value ${numLines}`);
    stockfishWorker.postMessage('go depth 20');

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.startsWith('info')) {
        const match = message.match(/multipv\s(\d+).*score\s(cp|mate)\s(-?\d+).*pv\s(.+)/);
        if (match) {
          const [, pvNumber, scoreType, scoreValue, pvMoves] = match;
          const evaluation = scoreType === 'cp' ? parseInt(scoreValue, 10) / 100 : parseInt(scoreValue, 10) * 100;
          const moves = pvMoves.split(' ');

          setLines((prevLines) => {
            const newLines = [...prevLines];
            newLines[parseInt(pvNumber, 10) - 1] = { evaluation, moves };
            return newLines;
          });
        }
      }
    };

    stockfishWorker.onmessage = handleMessage;

    return () => {
      stockfishWorker.terminate();
    };
  }, [fen, numLines]);

  return lines;
};

export default useStockfish;
