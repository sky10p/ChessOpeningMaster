import React from "react";
import { formatPercent, outcomePercentages } from "../utils";

type WDLBarProps = { win: number; draw: number; loss: number };

export const WDLBar: React.FC<WDLBarProps> = ({ win, draw, loss }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {([
        { label: "Win",  value: win,  bg: "bg-success/15", text: "text-success" },
        { label: "Draw", value: draw, bg: "bg-interactive",   text: "text-text-muted"   },
        { label: "Loss", value: loss, bg: "bg-danger/15",    text: "text-danger"    },
      ] as const).map(({ label, value, bg, text }) => (
        <div key={label} className={`rounded-lg ${bg} border border-border-subtle p-3 text-center`}>
          <p className={`text-lg font-semibold ${text}`}>{formatPercent(value)}</p>
          <p className="text-xs text-text-subtle mt-0.5">{label}</p>
        </div>
      ))}
    </div>
    <div className="h-1.5 rounded-full overflow-hidden flex bg-interactive">
      <div className="bg-success transition-all" style={{ width: `${win * 100}%` }} />
      <div className="bg-text-subtle transition-all"   style={{ width: `${draw * 100}%` }} />
      <div className="bg-danger transition-all"   style={{ width: `${loss * 100}%` }} />
    </div>
  </div>
);

type WDLMiniBarProps = { wins: number; draws: number; losses: number };

export const WDLMiniBar: React.FC<WDLMiniBarProps> = ({ wins, draws, losses }) => {
  const pct = outcomePercentages(wins, draws, losses);
  return (
    <div className="h-1.5 rounded-full overflow-hidden flex bg-interactive">
      <div className="bg-success" style={{ width: `${pct.win * 100}%` }} />
      <div className="bg-text-subtle"   style={{ width: `${pct.draw * 100}%` }} />
      <div className="bg-danger"   style={{ width: `${pct.loss * 100}%` }} />
    </div>
  );
};
