import * as React from 'react';
import { RepertoireItem } from './RepertoireItem';

export const RepertoireList: React.FC = () => {
  // Simula una lista de repertorios; esto se reemplazaría con datos reales en el futuro.
  const repertoires = [
    { id: 1, name: 'Repertorio principal' },
    { id: 2, name: 'Repertorio secundario' },
    { id: 3, name: 'Repertorio para rápidas' },
    { id: 4, name: 'Repertorio en construcción' }
  ];

  return (
    <div>
      <h2>Repertorios</h2>
      <ul>
        {repertoires.map(repertoire => (
          <RepertoireItem key={repertoire.id} repertoire={repertoire} />
        ))}
      </ul>
    </div>
  );
};
