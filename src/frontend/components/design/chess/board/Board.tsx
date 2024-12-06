import React, { CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import useBoardStyle from "./useBoardStyle";
import { Move, Square, Chess } from "chess.js";
import { BoardOrientation } from "../../../../../common/types/Orientation";
import { MoveVariantNode } from "../../../../models/VariantNode";

interface ChessProps {
  chess: Chess;
  setChess: (chess: Chess) => void;
}

interface MoveNodeProps {
  currentMoveNode: MoveVariantNode;
}

interface BoardConfigProps {
  orientation: BoardOrientation;
}

interface EventHandlersProps {
  handleSquareClick: (square: Square) => void;
  handleSquareRightClick: (square: Square) => void;
  selectedSquare: Square | null;
  setSelectedSquare: (square: Square | null) => void;
  possibleMoves: Move[];
  setPossibleMoves: (moves: Move[]) => void;
  circleSquares: Set<Square>;
  setCircleSquares: (squares: Set<Square>) => void;

  onDrop: (squares: { sourceSquare: Square; targetSquare: Square }) => boolean;
}

interface StyleHandlersProps {
  squareStyles: Record<string, CSSProperties>;
  setSquareStyles: (styles: CSSProperties) => void;
  dragOverSquare: Square | null;
  setDragOverSquare: (square: Square | null) => void;
  pieceMoved: boolean;
  setPieceMoved: (moved: boolean) => void;
}

type BoardProps = ChessProps &
  MoveNodeProps &
  BoardConfigProps &
  EventHandlersProps &
  StyleHandlersProps;

const Board: React.FC<BoardProps> = ({
  chess,
  currentMoveNode,
  orientation,
  squareStyles,
  setSquareStyles,
  dragOverSquare,
  setDragOverSquare,
  pieceMoved,
  setPieceMoved,
  handleSquareClick,
  handleSquareRightClick,
  selectedSquare,
  setSelectedSquare,
  possibleMoves,
  setPossibleMoves,
  circleSquares,
  setCircleSquares,
  onDrop,
}) => {
  const { arrows, updateArrows, onDragOverSquare } = useBoardStyle({
    chess,
    currentMoveNode,
    setSquareStyles,
    setSelectedSquare,
    setPossibleMoves,
    setCircleSquares,
    setDragOverSquare,
    setPieceMoved,
    selectedSquare,
    possibleMoves,
    circleSquares,
    dragOverSquare,
    pieceMoved,
  });


  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Chessboard
        id="game-board"
        position={chess.fen()}
        onSquareClick={handleSquareClick}
        onSquareRightClick={handleSquareRightClick}
        onPieceDrop={(sourceSquare, targetSquare) =>
          onDrop({ sourceSquare, targetSquare })
        }
        customArrows={arrows}
        onArrowsChange={(squares) => updateArrows(squares)}
        customArrowColor="rgba(20, 85, 30, 0.5)"
        onDragOverSquare={onDragOverSquare}
        customSquareStyles={squareStyles}
        customDropSquareStyle={{}}
        boardOrientation={orientation}
      />
    </div>
  );
};

export default Board;
