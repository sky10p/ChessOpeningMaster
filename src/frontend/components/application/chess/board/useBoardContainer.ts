import { useState } from "react";
import { Color, Move, Square, Chess } from "chess.js";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { useTrainRepertoireContext } from "../../../../contexts/TrainRepertoireContext";
import { useAlertContext } from "../../../../contexts/AlertContext";

export const useBoardContainer = (isTraining: boolean) => {
  const { chess, setChess, addMove, orientation, currentMoveNode } =
    useRepertoireContext();
  const { showAlert } = useAlertContext();
  const trainRepertoireContext = isTraining
    ? useTrainRepertoireContext()
    : null;
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [squareStyles, setSquareStyles] = useState({});
  const [dragOverSquare, setDragOverSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [circleSquares, setCircleSquares] = useState<Set<Square>>(new Set());
  const [pieceMoved, setPieceMoved] = useState(false);

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

  const isMoveValid = (from: string, to: string): boolean => {
    return possibleMoves.some((move) => move.from === from && move.to === to);
  };

  const safeMove = (chessInstance: Chess, from: string, to: string) => {
    try {
      return chessInstance.move({ from, to, promotion: "q" });
    } catch (error) {
      showAlert("Invalid move", "error", 1000);
      return null;
    }
  };

  const handleMove = (from: string, to: string): boolean => {
    const tempChess = new Chess(chess.fen());
    const move = safeMove(tempChess, from, to);
    if (move) {
      let isMoveAllowed = true;
      if (isTraining && trainRepertoireContext) {
        const trainingMoves = trainRepertoireContext.allowedMoves.map(
          (allowedMove) => allowedMove.getMove()
        );
        isMoveAllowed = trainingMoves.some(
          (trainingMove) =>
            trainingMove.from === move.from && trainingMove.to === move.to
        );
      }
      if (isTraining && !isMoveAllowed) {
        alert("La jugada no es válida según el repertorio.");
        unselectPiece();
        return false;
      } else {
        setChess(tempChess);
        addMove(move);
        unselectPiece();
        return true;
      }
    }
    setPossibleMoves([]);
    setSelectedSquare(null);
    setSquareStyles({});
    return false;
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
      setPieceMoved(true);
    }
  };

  const handleSquareRightClick = (square: Square) => {
    if (circleSquares.has(square)) {
      circleSquares.delete(square);
    } else {
      circleSquares.add(square);
    }
    setCircleSquares(new Set(circleSquares));
    currentMoveNode.circles = Array.from(circleSquares);
  };

  const onDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: Square;
    targetSquare: Square;
  }) => {
    setDragOverSquare(null);
    const handleMoveResult = handleMove(sourceSquare, targetSquare);
    setPieceMoved(true);
    return handleMoveResult;
  };

  return {
    chess,
    setChess,
    currentMoveNode,
    orientation,
    handleSquareClick,
    handleSquareRightClick,
    selectedSquare,
    setSelectedSquare,
    onDrop,
    squareStyles,
    setSquareStyles,
    dragOverSquare,
    setDragOverSquare,
    pieceMoved,
    setPieceMoved,
    circleSquares,
    setCircleSquares,
    possibleMoves,
    setPossibleMoves,
  };
};
