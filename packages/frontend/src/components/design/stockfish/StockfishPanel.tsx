import React from "react";
import useStockfish from "../../../libs/useStockfish";

interface StockfishPanelProps {
  fen: string;
  numLines: number;
}

export const StockfishPanel: React.FC<StockfishPanelProps> = ({
  fen,
  numLines,
}) => {
  const { lines, depth, time, maxDepth } = useStockfish(fen, numLines);

  return (
    <div className="p-4 rounded shadow-md w-full h-full">
      <div className="mb-2 text-sm text-gray-400">
        <strong>Depth:</strong> {depth}/{maxDepth} <strong>Time:</strong> {time}s
      </div>
      <div className="overflow-y-auto max-h-72">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="py-2 px-4">Line</th>
              <th className="py-2 px-4">Evaluation</th>
              <th className="py-2 px-4">Moves</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{line.evaluation}</td>
                <td className="py-2 px-4">{line.moves.join(" ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
