import { CSSProperties, useEffect, useState } from "react";
import { Chess, Color, Move, Square } from "chess.js";
import { MoveVariantNode } from "../../../../models/VariantNode";

interface UseBoardStyleProps {
  chess: Chess;
  currentMoveNode: MoveVariantNode;
  setSquareStyles: (styles: Record<string, CSSProperties>) => void;
  setSelectedSquare: (square: Square | null) => void;
  setPossibleMoves: (moves: Move[]) => void;
  setCircleSquares: (squares: Set<Square>) => void;
  setDragOverSquare: (square: Square | null) => void;
  setPieceMoved: (moved: boolean) => void;
  selectedSquare: Square | null;
  possibleMoves: Move[];
  circleSquares: Set<Square>;
  dragOverSquare: Square | null;
  pieceMoved: boolean;
}

const useBoardStyle = ({
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
}: UseBoardStyleProps) => {
  const [arrows, setArrows] = useState<Square[][]>([]);

  useEffect(() => {
    setCircleSquares(
      currentMoveNode.circles ? new Set(currentMoveNode.circles) : new Set()
    );
    setArrows(currentMoveNode.arrows ?? []);
  }, [currentMoveNode]);

  const dropSquareStyle: React.CSSProperties = {
    background: "rgba(20, 85, 30, 0.4)",
  };

  useEffect(() => {
    const styles: Record<string, CSSProperties> = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        background: "rgba(20, 85, 30, 0.5)",
      };
    }

    for (const circleSquare of Array.from(circleSquares)) {
      styles[circleSquare] = {
        borderRadius: "50%",
        boxSizing: "border-box",
        boxShadow: "inset 0 0 0 5px rgb(21, 120, 27)",
      };
    }

    for (const move of possibleMoves) {
      const piece = chess.get(move.to);
      styles[move.to] = {
        background: piece
          ? "radial-gradient(transparent 0%, transparent 79%, rgba(20, 85, 0, 0.3) 80%)"
          : "radial-gradient(rgba(20, 85, 30, 0.5) 19%, rgba(0, 0, 0, 0) 20%)",
      };
    }

    if (dragOverSquare) {
      styles[dragOverSquare] = dropSquareStyle;
    }

    setSquareStyles(styles);
  }, [chess, selectedSquare, possibleMoves, dragOverSquare, circleSquares]);

  const isCorrectPieceSelected = (square: Square, turn: Color) => {
    const piece = chess.get(square);

    return piece && piece.color === turn;
  };

  const selectPiece = (square: Square) => {
    if (isCorrectPieceSelected(square, chess.turn())) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setPossibleMoves(moves);
    } else {
      unselectPiece();
    }
  };

  const unselectPiece = () => {
    setSelectedSquare(null);
    setSquareStyles({});
    setPossibleMoves([]);
  };

  const updateArrows = (arrows: Square[][]) => {
    if (pieceMoved) {
      setPieceMoved(false);
      return;
    }
    currentMoveNode.arrows = arrows;
  };

  const onDragOverSquare = (square: Square) => {
    if (!selectedSquare) {
      selectPiece(square);
    }

    if (possibleMoves.some((move) => move.to === square)) {
      setDragOverSquare(square);
    } else {
      setDragOverSquare(null);
    }
  };

  return {
    arrows,
    updateArrows,
    onDragOverSquare,
  };
};

export default useBoardStyle;
