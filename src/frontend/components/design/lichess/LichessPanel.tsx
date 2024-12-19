import React, { useEffect, useState } from "react";
import {
  getLichessMoves,
  LichessMovesTypes,
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
  Checkbox,
  Button,
  FormGroup,
  FormControlLabel,
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
  const ratingOptions = [400, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500];
  const [moves, setMoves] = useState<MoveLichess[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<LichessMovesTypes>(LichessMovesTypes.MASTERS);
  const [ratings, setRatings] = useState<number[]>(ratingOptions);

  useEffect(() => {
    async function fetchMoves() {
      setLoading(true);
      setError(null);
      try {
        const result = await getLichessMoves(fen, source === "masters" ? LichessMovesTypes.MASTERS : LichessMovesTypes.LICHESS, ratings);
        setMoves(result.moves);
      } catch (err) {
        setError("An error occurred while fetching moves");
        setMoves([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMoves();
  }, [fen, source, ratings]);

  const handleSourceChange = (newSource: LichessMovesTypes) => {
    setSource(newSource);
  };

  const handleRatingsChange = (rating: number) => {
    setRatings((prevRatings) =>
      prevRatings.includes(rating)
        ? prevRatings.filter((r) => r !== rating)
        : [...prevRatings, rating]
    );
  };

  const handleToggleAll = () => {
    if (ratings.length === ratingOptions.length) {
      setRatings([]);
    } else {
      setRatings(ratingOptions);
    }
  };

  const totalGames = moves.reduce(
    (sum, move) => sum + move.white + move.draws + move.black,
    0
  );

  return (
    <div>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant={source === LichessMovesTypes.MASTERS ? "contained" : "outlined"}
          onClick={() => handleSourceChange(LichessMovesTypes.MASTERS)}
          size="small"
          style={{ marginRight: "8px", fontSize: "0.8rem" }}
        >
          Masters
        </Button>
        <Button
          variant={source === LichessMovesTypes.LICHESS ? "contained" : "outlined"}
          onClick={() => handleSourceChange(LichessMovesTypes.LICHESS)}
          size="small"
          style={{ fontSize: "0.8rem" }}
        >
          Lichess
        </Button>
      </Box>
      {source === LichessMovesTypes.LICHESS && (
        <FormGroup row style={{ justifyContent: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={ratings.length === ratingOptions.length}
                indeterminate={ratings.length > 0 && ratings.length < ratingOptions.length}
                onChange={handleToggleAll}
                size="small"
              />
            }
            label="Select All"
            style={{ marginRight: "8px", fontSize: "0.8rem" }}
          />
          {ratingOptions.map((rating) => (
            <FormControlLabel
              key={rating}
              control={
                <Checkbox
                  checked={ratings.includes(rating)}
                  onChange={() => handleRatingsChange(rating)}
                  size="small"
                />
              }
              label={rating.toString()}
              style={{ marginRight: "8px", fontSize: "0.8rem" }}
            />
          ))}
        </FormGroup>
      )}
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
