// src/pages/Repertoire.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import Board from '../chess/Board';

const Repertoire = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Repertoire ID: {id}</h2>
      <Board />
    </div>
  );
};

export default Repertoire;
