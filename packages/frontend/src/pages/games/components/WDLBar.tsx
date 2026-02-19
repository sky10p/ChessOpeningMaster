import React from "react";
import { formatPercent, outcomePercentages } from "../utils";

type WDLBarProps = { win: number; draw: number; loss: number };

export const WDLBar: React.FC<WDLBarProps> = ({ win, draw, loss }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {([
        { label: "Win",  value: win,  bg: "bg-emerald-500/15", text: "text-emerald-400" },
        { label: "Draw", value: draw, bg: "bg-slate-700/40",   text: "text-slate-400"   },
        { label: "Loss", value: loss, bg: "bg-rose-500/15",    text: "text-rose-400"    },
      ] as const).map(({ label, value, bg, text }) => (
        <div key={label} className={`rounded-lg ${bg} border border-slate-800 p-3 text-center`}>
          <p className={`text-lg font-semibold ${text}`}>{formatPercent(value)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
    <div className="h-1.5 rounded-full overflow-hidden flex bg-slate-800">
      <div className="bg-emerald-500 transition-all" style={{ width: `${win * 100}%` }} />
      <div className="bg-slate-500 transition-all"   style={{ width: `${draw * 100}%` }} />
      <div className="bg-rose-500 transition-all"   style={{ width: `${loss * 100}%` }} />
    </div>
  </div>
);

type WDLMiniBarProps = { wins: number; draws: number; losses: number };

export const WDLMiniBar: React.FC<WDLMiniBarProps> = ({ wins, draws, losses }) => {
  const pct = outcomePercentages(wins, draws, losses);
  return (
    <div className="h-1.5 rounded-full overflow-hidden flex bg-slate-800">
      <div className="bg-emerald-500" style={{ width: `${pct.win * 100}%` }} />
      <div className="bg-slate-500"   style={{ width: `${pct.draw * 100}%` }} />
      <div className="bg-rose-500"   style={{ width: `${pct.loss * 100}%` }} />
    </div>
  );
};
