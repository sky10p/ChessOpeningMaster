// src/components/RepertoryView.tsx
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js'
import Chessboard from 'chessboardjsx';

const RepertoryView = () => {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());

  useEffect(() => {
    const timer = setInterval(() => {
      const moves = chess.moves();
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        chess.move(randomMove);
        setFen(chess.fen());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [chess]);

  return (
    <div>
      <Chessboard position={fen} />
    </div>
  );
};

export default RepertoryView;
