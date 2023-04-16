import React, { useEffect, useState } from "react";
import { useBoardContext } from "./BoardContext";

const BoardInfo: React.FC = () => {
  const { goToMove, currentIndex, getMovements } = useBoardContext();

  

  return (
    <div>
      <h2>Moves</h2>
      <div>
        {getMovements().map((move, index) => (
          <button
            key={`move-${index}`}
            onClick={() => goToMove(index)}
            style={{
              fontWeight: index === currentIndex() ? "bold" : "normal",
            }}
          >
            {move.san}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardInfo;
