import React, { useEffect, useState } from "react";
import { getLichessMoves, LichessMovesTypes, MoveLichess } from "../../../../repository/lichess/lichessRepository";
import ResultBar from "../../statistics/ResultBar";

interface StatisticsSubpanelProps {
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

const StatisticsSubpanel: React.FC<StatisticsSubpanelProps> = ({ fen }) => {
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
    <div className="rounded-md shadow-surface w-full overflow-hidden border border-border-default">
      {/* Selector de fuente de datos */}
      <div className="bg-surface-raised p-3 border-b border-border-default">
        <div className="flex justify-center mb-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-l-md border border-border-default focus:z-10 focus:ring-2 focus:ring-brand focus:outline-none
                ${source === LichessMovesTypes.MASTERS 
                  ? "bg-brand text-text-on-brand border-brand" 
                  : "bg-surface text-text-muted hover:bg-interactive"}`}
              onClick={() => handleSourceChange(LichessMovesTypes.MASTERS)}
            >
              Masters
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-r-md border border-border-default focus:z-10 focus:ring-2 focus:ring-brand focus:outline-none
                ${source === LichessMovesTypes.LICHESS 
                  ? "bg-brand text-text-on-brand border-brand" 
                  : "bg-surface text-text-muted hover:bg-interactive"}`}
              onClick={() => handleSourceChange(LichessMovesTypes.LICHESS)}
            >
              Lichess
            </button>
          </div>
        </div>
        
        {/* Filtros de rating (solo para Lichess) */}
        {source === LichessMovesTypes.LICHESS && (
          <div className="flex flex-wrap justify-center gap-1 w-full">
            <label className="flex items-center px-2 py-1 bg-surface rounded-md text-xs">
              <input
                type="checkbox"
                checked={ratings.length === ratingOptions.length}
                onChange={handleToggleAll}
                className="mr-1.5 h-3 w-3 rounded border-border-default text-brand focus:ring-brand"
              />
              <span className="text-text-muted">All</span>
            </label>
            {ratingOptions.map((rating) => (
              <label key={rating} className="flex items-center px-2 py-1 bg-surface rounded-md text-xs">
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
      </div>
      
      {/* Contenido principal */}
      <div className="bg-surface">
        {loading && (
          <div className="flex items-center justify-center h-32 text-text-subtle">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading statistics...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-32 text-danger px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {!loading && !error && moves.length === 0 && (
          <div className="flex items-center justify-center h-32 text-text-subtle px-4">
            <span>No statistics available for this position.</span>
          </div>
        )}
        
        {!loading && !error && moves.length > 0 && (
          <div className="overflow-y-auto max-h-72">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-raised sticky top-0">
                <tr>
                  <th className="py-2 px-3 text-xs font-medium text-text-muted">Move</th>
                  <th className="py-2 px-3 text-xs font-medium text-text-muted whitespace-nowrap">Games</th>
                  <th className="py-2 px-3 text-xs font-medium text-text-muted w-full">Results</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((move, index) => {
                  const moveTotal = move.white + move.draws + move.black;
                  const winPercentage = (move.white / moveTotal) * 100;
                  const drawPercentage = (move.draws / moveTotal) * 100;
                  const lossPercentage = (move.black / moveTotal) * 100;
                  return (
                    <tr key={index} className="border-b border-border-subtle hover:bg-interactive transition-colors">
                      <td className="py-2 px-3 font-medium text-text-base">{move.san}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-text-subtle">
                        <span className="font-medium text-text-muted">{((moveTotal / totalGames) * 100).toFixed(1)}%</span>
                        <span className="text-xs ml-1">({moveTotal})</span>
                      </td>
                      <td className="py-2 px-3 w-full">
                        <div className="w-full flex items-center gap-2">
                          <ResultBar
                            winPercentage={winPercentage}
                            drawPercentage={drawPercentage}
                            lossPercentage={lossPercentage}
                          />
                          <div className="flex gap-1 text-xs whitespace-nowrap">
                            <span className="text-success">{winPercentage.toFixed(0)}%</span>
                            <span className="text-text-subtle">{drawPercentage.toFixed(0)}%</span>
                            <span className="text-danger">{lossPercentage.toFixed(0)}%</span>
                          </div>
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
    </div>
  );
};

export default StatisticsSubpanel;
