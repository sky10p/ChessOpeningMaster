import { PresentationChartLineIcon } from "@heroicons/react/24/outline";
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
      } catch {
        setError("An error occurred while fetching moves");
        setMoves([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMoves();
  }, [fen, source, ratings]);

  const handleRatingsChange = (rating: number) => {
    setRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const handleToggleAll = () => {
    setRatings(ratings.length === ratingOptions.length ? [] : ratingOptions);
  };

  const totalGames = moves.reduce((sum, m) => sum + m.white + m.draws + m.black, 0);

  return (
    <div className="w-full bg-surface text-text-base">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-raised border-b border-border-default">
        <div className="flex items-center gap-2">
          <PresentationChartLineIcon className="h-4 w-4 text-brand" />
          <span className="text-sm font-semibold text-text-base">Statistical Analysis</span>
        </div>
        <div className="inline-flex rounded-md overflow-hidden border border-border-default">
          <button
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              source === LichessMovesTypes.MASTERS
                ? "bg-brand text-text-on-brand"
                : "bg-surface-raised text-text-muted hover:bg-interactive"
            }`}
            onClick={() => setSource(LichessMovesTypes.MASTERS)}
          >
            Masters
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium border-l border-border-default transition-colors ${
              source === LichessMovesTypes.LICHESS
                ? "bg-brand text-text-on-brand"
                : "bg-surface-raised text-text-muted hover:bg-interactive"
            }`}
            onClick={() => setSource(LichessMovesTypes.LICHESS)}
          >
            Lichess
          </button>
        </div>
      </div>

      {source === LichessMovesTypes.LICHESS && (
        <div className="px-3 py-2 bg-surface border-b border-border-subtle flex flex-wrap justify-center gap-1">
          <label className="flex items-center px-2 py-1 bg-surface-raised rounded-md text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={ratings.length === ratingOptions.length}
              onChange={handleToggleAll}
              className="mr-1.5 h-3 w-3 rounded border-border-default text-brand focus:ring-brand"
            />
            <span className="text-text-muted">All</span>
          </label>
          {ratingOptions.map((rating) => (
            <label key={rating} className="flex items-center px-2 py-1 bg-surface-raised rounded-md text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={ratings.includes(rating)}
                onChange={() => handleRatingsChange(rating)}
                className="mr-1.5 h-3 w-3 rounded border-border-default text-brand focus:ring-brand"
              />
              <span className="text-text-muted">{rating}</span>
            </label>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-28 text-text-subtle text-sm gap-2">
          <svg className="animate-spin h-4 w-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading statistics…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-28 text-danger text-sm px-4">{error}</div>
      )}

      {!loading && !error && moves.length === 0 && (
        <div className="flex items-center justify-center h-28 text-text-subtle text-sm px-4">
          No data for this position.
        </div>
      )}

      {!loading && !error && moves.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-raised border-b border-border-default sticky top-0">
            <tr>
              <th className="py-2 px-3 text-xs font-medium text-text-muted">Move</th>
              <th className="py-2 px-3 text-xs font-medium text-text-muted whitespace-nowrap">Games %</th>
              <th className="py-2 px-3 text-xs font-medium text-text-muted w-full">Results</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move, index) => {
              const moveTotal = move.white + move.draws + move.black;
              const winPct = (move.white / moveTotal) * 100;
              const drawPct = (move.draws / moveTotal) * 100;
              const lossPct = (move.black / moveTotal) * 100;
              return (
                <tr key={index} className="border-b border-border-subtle hover:bg-interactive transition-colors">
                  <td className="py-2 px-3 font-medium text-text-base">{move.san}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="font-medium text-text-muted">{((moveTotal / totalGames) * 100).toFixed(1)}%</span>
                    <span className="text-xs text-text-subtle ml-1">({moveTotal})</span>
                  </td>
                  <td className="py-2 px-3 w-full">
                    <div className="w-full flex items-center gap-2">
                      <ResultBar winPercentage={winPct} drawPercentage={drawPct} lossPercentage={lossPct} />
                      <div className="flex gap-1 text-xs whitespace-nowrap">
                        <span className="text-success">{winPct.toFixed(0)}%</span>
                        <span className="text-text-subtle">{drawPct.toFixed(0)}%</span>
                        <span className="text-danger">{lossPct.toFixed(0)}%</span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StatisticsPanel;
