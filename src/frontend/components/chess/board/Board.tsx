import React, { CSSProperties, useEffect, useState } from "react";
import { Color, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";

interface BoardProps {
  calcWidth: (dimensions: { screenWidth: number }) => number;
  isTraining?: boolean;
}

const Board: React.FC<BoardProps> = ({ calcWidth, isTraining = false }) => {
  const { chess, setChess, addMove, orientation } = useRepertoireContext();
  const trainRepertoireContext = isTraining
    ? useTrainRepertoireContext()
    : null;
  const [squareStyles, setSquareStyles] = useState({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [dragOverSquare, setDragOverSquare] = useState<Square | null>(null);
  const [circleSquares, setCircleSquares] = useState<Set<Square>>(new Set());
  const [boardWidth, setBoardWidth] = useState(
    calcWidth({ screenWidth: window.innerWidth })
  );

  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(calcWidth({ screenWidth: window.innerWidth }));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

    for (const circleSquare of circleSquares) {
      styles[circleSquare] = {
        borderRadius: "50%",
        boxSizing: "border-box",
        boxShadow: "inset 0 0 0 5px rgb(21, 120, 27)",
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
  }, [chess, selectedSquare, possibleMoves, dragOverSquare, circleSquares]);

  const isCorrectPieceSelected = (square: Square, turn: Color) => {
    const piece = chess.get(square);

    return piece && piece.color === turn;
  };

  const selectPiece = (square: Square) => {
    if (isCorrectPieceSelected(square, chess.turn())) {
      setSelectedSquare(square);
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

  const handleMove = (from: string, to: string): boolean => {
    let correctMove = false;
    if (isMoveValid(from, to)) {
      const move = chess.move({ from, to, promotion: "q" });

      if (move) {
        setChess(chess);
        addMove(move);
        correctMove = true;
      }
    }
    setPossibleMoves([]);
    setSelectedSquare(null);
    setSquareStyles({});
    return correctMove;
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

  const handleSquareRightClick = (square: Square) => {
    if (circleSquares.has(square)) {
      circleSquares.delete(square);
    } else {
      circleSquares.add(square);
    }
    setCircleSquares(new Set(circleSquares));
  };

  const onDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: Square;
    targetSquare: Square;
  }) => {
    setDragOverSquare(null);

    return handleMove(sourceSquare, targetSquare);
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
        onSquareRightClick={handleSquareRightClick}
        onPieceDrop={(sourceSquare, targetSquare) =>
          onDrop({ sourceSquare, targetSquare })
        }
        customArrowColor="rgba(20, 85, 30, 0.5)"
        onDragOverSquare={onDragOverSquare}
        customSquareStyles={squareStyles}
        customDropSquareStyle={{}}
        boardOrientation={orientation}
        boardWidth={boardWidth}
      />
    </div>
  );
};

export default Board;
