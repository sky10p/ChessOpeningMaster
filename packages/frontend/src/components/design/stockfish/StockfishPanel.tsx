import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import React from "react";
import useStockfish from "../../../libs/useStockfish";
import { uciToSan } from "../../../utils/chess/uciToSan";

interface StockfishPanelProps {
  fen: string;
  numLines: number;
}

function getEvalColor(evaluation: number): string {
  if (evaluation > 3) return "text-green-400";
  if (evaluation > 1.5) return "text-green-300";
  if (evaluation > 0.5) return "text-blue-300";
  if (evaluation > -0.5) return "text-text-muted";
  if (evaluation > -1.5) return "text-orange-300";
  return "text-red-400";
}

function formatEval(evaluation: number): string {
  const abs = Math.abs(evaluation);
  if (abs > 900) return `M${Math.ceil((1000 - abs) / 2)}`;
  const sign = evaluation > 0 ? "+" : evaluation < 0 ? "-" : "";
  return `${sign}${abs.toFixed(1)}`;
}

export const StockfishPanel: React.FC<StockfishPanelProps> = ({ fen, numLines }) => {
  const { lines, depth, time, maxDepth } = useStockfish(fen, numLines);
  const progress = maxDepth > 0 ? Math.round((depth / maxDepth) * 100) : 0;

  return (
    <div className="w-full bg-surface text-text-base">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-raised border-b border-border-default">
        <div className="flex items-center gap-2">
          <ComputerDesktopIcon className="h-4 w-4 text-brand" />
          <span className="text-sm font-semibold text-text-base">Engine Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full bg-border-default overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-brand">{depth}/{maxDepth}</span>
          </div>
          <span className="text-xs text-text-subtle">{time}s</span>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="flex items-center justify-center h-28 text-text-subtle text-sm">
          Calculating…
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-raised border-b border-border-default">
            <tr>
              <th className="py-2 px-3 text-xs font-medium text-text-muted w-8">#</th>
              <th className="py-2 px-3 text-xs font-medium text-text-muted w-16">Eval</th>
              <th className="py-2 px-3 text-xs font-medium text-text-muted">Best line</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const sanMoves = uciToSan(line.moves, fen);
              return (
                <tr key={index} className="border-b border-border-subtle hover:bg-interactive transition-colors">
                  <td className="py-2 px-3 text-text-subtle font-mono text-xs">{index + 1}</td>
                  <td className={`py-2 px-3 font-mono font-semibold ${getEvalColor(line.evaluation)}`}>
                    {formatEval(line.evaluation)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap gap-1">
                      {sanMoves.map((move, mi) => (
                        <span
                          key={mi}
                          className={`px-1 py-0.5 rounded text-xs ${
                            mi === 0 ? "bg-brand/20" : ""
                          }`}
                        >
                          {move}
                        </span>
                      ))}
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
