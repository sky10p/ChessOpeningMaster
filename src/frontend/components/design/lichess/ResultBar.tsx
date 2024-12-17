import React from 'react';
import './ResultBar.css';

interface ResultBarProps {
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;
}

const ResultBar: React.FC<ResultBarProps> = ({ winPercentage, drawPercentage, lossPercentage }) => {
  return (
    <div className="bar">
      <span className="white" style={{ width: `${winPercentage}%` }}>
        {winPercentage.toFixed(1)}%
      </span>
      <span className="draws" style={{ width: `${drawPercentage}%` }}>
        {drawPercentage.toFixed(1)}%
      </span>
      <span className="black" style={{ width: `${lossPercentage}%` }}>
        {lossPercentage.toFixed(1)}%
      </span>
    </div>
  );
};

export default ResultBar;