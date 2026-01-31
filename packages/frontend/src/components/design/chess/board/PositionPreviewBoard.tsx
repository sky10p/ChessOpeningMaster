import React from "react";
import { Chessboard } from "react-chessboard";
import { BoardOrientation } from "@chess-opening-master/common";
import { Chess, Square } from "chess.js";

interface PositionPreviewBoardProps {
  fen: string;
  orientation?: BoardOrientation;
  wrongMove?: string;
  size?: number;
}

const PositionPreviewBoard: React.FC<PositionPreviewBoardProps> = ({
  fen,
  orientation,
  wrongMove,
  size = 200,
}) => {
  const chess = new Chess(fen);
  const turn = chess.turn();
  const boardOrientation = orientation ?? (turn === "w" ? "white" : "black");

  const getWrongMoveArrow = (): Square[][] => {
    if (!wrongMove) return [];
    
    try {
      const tempChess = new Chess(fen);
      const move = tempChess.move(wrongMove);
      if (move) {
        return [[move.from, move.to]];
      }
    } catch {
      return [];
    }
    return [];
  };

  return (
    <div style={{ width: size, height: size }}>
      <Chessboard
        id="position-preview"
        position={fen}
        boardOrientation={boardOrientation}
        arePiecesDraggable={false}
        customArrows={getWrongMoveArrow()}
        customArrowColor="rgba(220, 38, 38, 0.8)"
      />
    </div>
  );
};

export default PositionPreviewBoard;
