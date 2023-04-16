import React, { useEffect, useState } from "react";
import { useBoardContext } from "./BoardContext";
import { parse } from "chess-pgn-parser";

const BoardInfo: React.FC = () => {
  const { chess, goToMove, currentIndex } = useBoardContext();
  const [pgnMoves, setPgnMoves] = useState<string[]>([]);

  useEffect(() => {
    const pgn = chess.pgn();
    const parsedPgn = parse(pgn);
    const moves = parsedPgn.moves.map((move) => move);
    setPgnMoves(moves);
  }, [chess]);

  

  return (
    <div>
      <h2>Moves</h2>
      <div>
        {pgnMoves.map((move, index) => (
          <button
            key={`move-${index}`}
            onClick={() => goToMove(index)}
            style={{
              fontWeight: index === currentIndex() ? "bold" : "normal",
            }}
          >
            {move}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardInfo;
