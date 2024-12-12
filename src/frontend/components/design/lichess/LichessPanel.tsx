import React, { useEffect, useState } from 'react';
import { getLichessMoves, MoveLichess } from '../../../repository/lichess/lichessRepository';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface LichessPanelProps {
  fen: string;
}

export interface Move {
  uci: string;
  san: string;
  averageRating: number;
  white: number;
  draws: number;
  black: number;
  game: null;
  opening: {
    eco: string;
    name: string;
  };
}

const LichessPanel: React.FC<LichessPanelProps> = ({ fen }) => {
  const [moves, setMoves] = useState<MoveLichess[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMoves() {
      setLoading(true);
      setError(null);
      try {
        const result = await getLichessMoves(fen, 'masters');
        setMoves(result.moves);
      } catch (err) {
        setError('An error occurred while fetching moves');
        setMoves([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMoves();
  }, [fen]);

  // Calculate total games for percentage calculations
  const totalGames = moves.reduce((sum, move) => sum + move.white + move.draws + move.black, 0);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Move</TableCell>
                <TableCell>Percentage of Games</TableCell>
                <TableCell>Number of Games</TableCell>
                <TableCell>Win %</TableCell>
                <TableCell>Draw %</TableCell>
                <TableCell>Loss %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moves.map((move, index) => {
                const moveTotal = move.white + move.draws + move.black;
                return (
                  <TableRow key={index}>
                    <TableCell>{move.san}</TableCell>
                    <TableCell>{((moveTotal / totalGames) * 100).toFixed(1)}%</TableCell>
                    <TableCell>{moveTotal}</TableCell>
                    <TableCell>{((move.white / moveTotal) * 100).toFixed(1)}%</TableCell>
                    <TableCell>{((move.draws / moveTotal) * 100).toFixed(1)}%</TableCell>
                    <TableCell>{((move.black / moveTotal) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default LichessPanel;