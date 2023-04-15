import * as React from 'react';

export const OpeningTable: React.FC = () => {
  const openings = [
    { id: 1, name: 'Apertura Española', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5' },
    { id: 2, name: 'Defensa Siciliana', moves: '1.e4 c5' },
    { id: 3, name: 'Defensa Francesa', moves: '1.e4 e6' }
  ];

  return (
    <div>
      <h2>Aperturas</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Movimientos</th>
          </tr>
        </thead>
        <tbody>
          {openings.map(opening => (
            <tr key={opening.id}>
              <td>{opening.name}</td>
              <td>{opening.moves}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
