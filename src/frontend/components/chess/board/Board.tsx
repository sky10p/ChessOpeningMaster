import React, { CSSProperties, useEffect, useState } from "react";
import { Color, Move, Square } from "chess.js";
import Chessboard from "chessboardjsx";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";
import { MoveVariantNode } from "../utils/VariantNode";

interface BoardProps {
  calcWidth?: (dimensions: { screenWidth: number }) => number;
  isTraining?: boolean;
}

const Board: React.FC<BoardProps> = ({ calcWidth, isTraining = false }) => {
  const { chess, setChess, addMove, orientation, currentMoveNode } =
    useRepertoireContext();
  const trainRepertoireContext = isTraining
    ? useTrainRepertoireContext()
    : null;
  const [squareStyles, setSquareStyles] = useState({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [dragOverSquare, setDragOverSquare] = useState<Square | null>(null);

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

    for (const move of possibleMoves) {
      styles[move.to] = {
        background:
          "radial-gradient(rgba(20, 85, 30, 0.5) 19%, rgba(0, 0, 0, 0) 20%)",
      };
    }

    if (dragOverSquare) {
      styles[dragOverSquare] = dropSquareStyle;
    }

    setSquareStyles(styles);
  }, [selectedSquare, possibleMoves, dragOverSquare]);

  const isCorrectPieceSelected = (square: Square, turn: Color) => {
    const piece = chess.get(square);

    return piece && piece.color === turn;
  };

  const selectPiece = (square: Square) => {
    if (isCorrectPieceSelected(square, chess.turn())) {
      setSelectedSquare(square);
      //const moves = isTraining && trainRepertoireContext ? trainRepertoireContext.allowedMoves.map(allowedMove => allowedMove.getMove()) : chess.moves({ square: square as Square, verbose: true });
      const moves = chess.moves({ square: square as Square, verbose: true });
      const trainingMoves =
        isTraining && trainRepertoireContext
          ? trainRepertoireContext.allowedMoves.map((allowedMove) =>
              allowedMove.getMove()
            )
          : [];
      const filteredMoves = moves.filter((move) =>
        trainingMoves.some(
          (trainingMove) =>
            trainingMove.from === move.from && trainingMove.to === move.to
        )
      );
      setPossibleMoves(isTraining ? filteredMoves : moves);
    } else {
      unselectPiece();
    }
  };

  const unselectPiece = () => {
    setSelectedSquare(null);
    setSquareStyles({});
    setPossibleMoves([]);
  };

  const isMoveValid = (from: string, to: string): boolean => {
    return possibleMoves.some((move) => move.from === from && move.to === to);
  };

  const handleMove = (from: string, to: string) => {
    let lastMove: MoveVariantNode | undefined;
    if (isMoveValid(from, to)) {
      const move = chess.move({ from, to, promotion: "q" });

      if (move) {
        setChess(chess);
        lastMove = currentMoveNode.children.find(
          (child) =>
            child.getMove().from === move.from && child.getMove().to === move.to
        );
        addMove(move);
      }
    }
    setPossibleMoves([]);
    setSelectedSquare(null);
    setSquareStyles({});
    if (isTraining && lastMove && trainRepertoireContext) {
      trainRepertoireContext.playOpponentMove(lastMove);
    }
  };

  const handleSquareClick = (square: Square) => {
    if (!selectedSquare) {
      selectPiece(square);
    } else if (selectedSquare === square) {
      unselectPiece();
    } else if (selectedSquare && !isMoveValid(selectedSquare, square)) {
      selectPiece(square);
    } else if (selectedSquare && isMoveValid(selectedSquare, square)) {
      handleMove(selectedSquare, square);
    }
  };

  const onDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string;
  }) => {
    handleMove(sourceSquare, targetSquare);
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

  return (
    <div>
      <Chessboard
        position={chess.fen()}
        onSquareClick={handleSquareClick}
        onDrop={onDrop}
        onDragOverSquare={onDragOverSquare}
        squareStyles={squareStyles}
        calcWidth={calcWidth ? calcWidth : undefined}
        dropSquareStyle={{}}
        orientation={orientation}
      />
    </div>
  );
};

export default Board;
