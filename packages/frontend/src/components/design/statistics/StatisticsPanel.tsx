import React, { useEffect, useState } from "react";
import {
  getLichessMoves,
  LichessMovesTypes,
  MoveLichess,
} from "../../../repository/lichess/lichessRepository";
import ResultBar from "./ResultBar";

interface StatisticsPanelProps {
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

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ fen }) => {
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
    <div className="p-4 rounded shadow-md w-full h-full">
      <div className="flex justify-center mb-2">
        <button
          className={`px-4 py-2 mr-2 text-sm font-medium rounded ${source === LichessMovesTypes.MASTERS ? "bg-accent text-black" : "bg-gray-700 text-white"}`}
          onClick={() => handleSourceChange(LichessMovesTypes.MASTERS)}
        >
          Masters
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded ${source === LichessMovesTypes.LICHESS ? "bg-accent text-black" : "bg-gray-700 text-white"}`}
          onClick={() => handleSourceChange(LichessMovesTypes.LICHESS)}
        >
          Lichess
        </button>
      </div>
      {source === LichessMovesTypes.LICHESS && (
        <div className="flex justify-center mb-2">
          <label className="flex items-center mr-2 text-sm">
            <input
              type="checkbox"
              checked={ratings.length === ratingOptions.length}
              onChange={handleToggleAll}
              className="mr-1"
            />
            Select All
          </label>
          {ratingOptions.map((rating) => (
            <label key={rating} className="flex items-center mr-2 text-sm">
              <input
                type="checkbox"
                checked={ratings.includes(rating)}
                onChange={() => handleRatingsChange(rating)}
                className="mr-1"
              />
              {rating}
            </label>
          ))}
        </div>
      )}
      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-y-auto h-full">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="py-2 px-4">Move</th>
                <th className="py-2 px-4">Games</th>
                <th className="py-2 px-4">Number games</th>
                <th className="py-2 px-4 w-full">Results</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move, index) => {
                const moveTotal = move.white + move.draws + move.black;
                const winPercentage = (move.white / moveTotal) * 100;
                const drawPercentage = (move.draws / moveTotal) * 100;
                const lossPercentage = (move.black / moveTotal) * 100;
                return (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2 px-4">{move.san}</td>
                    <td className="py-2 px-4">{((moveTotal / totalGames) * 100).toFixed(1)}%</td>
                    <td className="py-2 px-4">{moveTotal}</td>
                    <td className="py-2 px-4 w-full">
                      <div className="w-full">
                        <ResultBar
                          winPercentage={winPercentage}
                          drawPercentage={drawPercentage}
                          lossPercentage={lossPercentage}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
