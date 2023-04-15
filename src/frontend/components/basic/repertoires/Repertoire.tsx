// src/pages/Repertoire.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import RepertoryView from './RepertoryView';

const Repertoire = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Repertoire ID: {id}</h2>
      <RepertoryView />
    </div>
  );
};

export default Repertoire;
