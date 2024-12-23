import React from 'react';

interface ResultBarProps {
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;
}

const ResultBar: React.FC<ResultBarProps> = ({ winPercentage, drawPercentage, lossPercentage }) => {
  return (
    <div className="flex w-full h-4 rounded overflow-hidden shadow-sm">
      <span className="flex justify-center items-center text-xs transition-width duration-1000 bg-gray-300 text-black" style={{ width: `${winPercentage}%` }}>
        {winPercentage.toFixed(1)}%
      </span>
      <span className="flex justify-center items-center text-xs transition-width duration-1000 bg-gray-500 text-white" style={{ width: `${drawPercentage}%` }}>
        {drawPercentage.toFixed(1)}%
      </span>
      <span className="flex justify-center items-center text-xs transition-width duration-1000 bg-black text-white" style={{ width: `${lossPercentage}%` }}>
        {lossPercentage.toFixed(1)}%
      </span>
    </div>
  );
};

export default ResultBar;