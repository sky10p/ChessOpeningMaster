// src/components/RepertoryView.tsx
import React, { CSSProperties, useEffect, useState } from "react";
import { Chess, Color, Move, Square } from "chess.js";
import Chessboard from "chessboardjsx";

const Board = () => {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [squareStyles, setSquareStyles] = useState({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [dragOverSquare, setDragOverSquare] = useState<Square | null>(null);

  const dropSquareStyle = {
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

  const handleMove = (from: string, to: string) => {
    if (isMoveValid(from, to)) {
      const move = chess.move({ from, to, promotion: "q" });
      if (move) {
        setFen(chess.fen());
      }
    }
    setPossibleMoves([]);
    setSelectedSquare(null);
    setSquareStyles({});
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
        position={fen}
        onSquareClick={handleSquareClick}
        onDrop={onDrop}
        onDragOverSquare={onDragOverSquare}
        squareStyles={squareStyles}
        dropSquareStyle={{}}
      />
    </div>
  );
};

export default Board;
