import React, { useEffect, useState } from "react";
import {
  getLichessMoves,
  MoveLichess,
} from "../../../repository/lichess/lichessRepository";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import ResultBar from "./ResultBar";
import "./ResultBar.css";

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
        const result = await getLichessMoves(fen, "masters");
        setMoves(result.moves);
      } catch (err) {
        setError("An error occurred while fetching moves");
        setMoves([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMoves();
  }, [fen]);

  // Calculate total games for percentage calculations
  const totalGames = moves.reduce(
    (sum, move) => sum + move.white + move.draws + move.black,
    0
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <TableContainer component={Paper} style={{ width: "100%", maxHeight: "300px", overflowY: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Move</TableCell>
                <TableCell>Games</TableCell>
                <TableCell>Number games</TableCell>
                <TableCell>Results</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moves.map((move, index) => {
                const moveTotal = move.white + move.draws + move.black;
                const winPercentage = (move.white / moveTotal) * 100;
                const drawPercentage = (move.draws / moveTotal) * 100;
                const lossPercentage = (move.black / moveTotal) * 100;
                return (
                  <TableRow key={index}>
                    <TableCell>{move.san}</TableCell>
                    <TableCell>
                      {((moveTotal / totalGames) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>{moveTotal}</TableCell>
                    <TableCell width={600}>
                      <Box style={{ width: "100%" }}>
                        <ResultBar
                          winPercentage={winPercentage}
                          drawPercentage={drawPercentage}
                          lossPercentage={lossPercentage}
                        />
                      </Box>
                    </TableCell>
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
