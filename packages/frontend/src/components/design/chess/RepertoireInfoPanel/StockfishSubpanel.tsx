import React from "react";
import { Line } from "../../../../libs/stockfish.models";
import { uciToSan } from "../../../../utils/chess/uciToSan";

interface StockfishSubpanelProps {
    fen: string;
    lines: Line[];
}

export const StockfishSubpanel: React.FC<StockfishSubpanelProps> = ({
    fen,
    lines,  
}) => {
 return (
    <div className="rounded-md shadow-md w-full overflow-hidden border border-slate-700">
      <div className="overflow-y-auto max-h-72">
        {lines.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="py-2 px-4 text-xs font-medium text-slate-400">Eval</th>
                <th className="py-2 px-4 text-xs font-medium text-slate-400">Sequence</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-800 transition-colors">
                  <td className={`py-2 px-4 font-mono ${getEvaluationColorClass(line.evaluation)}`}>
                    {formatEvaluation(line.evaluation)}
                  </td>
                  <td className="py-2 px-4 truncate max-w-xs font-medium" title={line.moves.join(" ")}>
                    <div className="flex flex-wrap gap-1">
                      {uciToSan(line.moves, fen).map((move, moveIndex) => (
                        <span 
                          key={moveIndex} 
                          className={`px-1 py-0.5 rounded ${moveIndex === 0 ? 'bg-blue-900 bg-opacity-40' : ''}`}
                        >
                          {move}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <p>Engine analysis loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getEvaluationColorClass(evaluation: number): string {
  if (evaluation > 3) return 'text-green-400';
  if (evaluation > 1.5) return 'text-green-300';
  if (evaluation > 0.5) return 'text-blue-300';
  if (evaluation > -0.5) return 'text-slate-300';
  if (evaluation > -1.5) return 'text-orange-300';
  return 'text-red-400';
}

function formatEvaluation(evaluation: number): string {
  const absEval = Math.abs(evaluation);
  const sign = evaluation > 0 ? '+' : evaluation < 0 ? '-' : '';
  
  // Si es un mate
  if (absEval > 900) {
    return `M${Math.ceil((1000 - absEval) / 2)}`;
  }
  
  // Formato normal con un decimal
  return `${sign}${absEval.toFixed(1)}`;
}
