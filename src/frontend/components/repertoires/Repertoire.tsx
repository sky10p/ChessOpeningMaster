// src/pages/Repertoire.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import BoardContainer from '../chess/BoardContainer';

const Repertoire = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Repertoire ID: {id}</h2>
      <BoardContainer />
    </div>
  );
};

export default Repertoire;
