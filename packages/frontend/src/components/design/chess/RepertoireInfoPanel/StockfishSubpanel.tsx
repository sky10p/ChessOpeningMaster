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
    <div className="rounded shadow-md w-full h-full">
      <div className="overflow-y-auto max-h-72">
        <table className="w-full text-left text-sm text-gray-400">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className={`py-2 px-4 ${line.evaluation > 0 ? 'text-white' : 'text-black'}`}>
                  {line.evaluation}
                </td>
                <td className="py-2 px-4 truncate max-w-xs" title={line.moves.join(" ")}>
                  {uciToSan(line.moves, fen).join(" ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
