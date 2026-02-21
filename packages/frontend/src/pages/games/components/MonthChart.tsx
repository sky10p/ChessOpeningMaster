import React from "react";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseMonthLabel = (month: string): { short: string; year: string } => {
  const parts = month.split("-");
  if (parts.length === 2) {
    const m = parseInt(parts[1], 10);
    const y = parts[0].slice(2);
    return { short: MONTH_ABBR[m - 1] ?? month, year: `'${y}` };
  }
  return { short: month.slice(0, 3), year: "" };
};

type MonthChartProps = {
  gamesByMonth: Array<{ month: string; games: number }>;
  maxMonthGames: number;
};

const BAR_AREA_H = 100;

const MonthChart: React.FC<MonthChartProps> = ({ gamesByMonth, maxMonthGames }) => {
  if (gamesByMonth.length === 0) {
    return <p className="text-sm text-slate-500">No data for current filters.</p>;
  }

  const showEvery = gamesByMonth.length > 18 ? 3 : gamesByMonth.length > 9 ? 2 : 1;

  return (
    <div className="flex items-end gap-1" style={{ height: BAR_AREA_H + 40 }}>
      {gamesByMonth.map((m, i) => {
        const barPct = maxMonthGames > 0 ? Math.max(2, (m.games / maxMonthGames) * 100) : 2;
        const barH = Math.round((barPct / 100) * BAR_AREA_H);
        const showLabel = i % showEvery === 0;
        const { short, year } = parseMonthLabel(m.month);
        return (
          <div
            key={m.month}
            title={`${short} ${year}: ${m.games} games`}
            className="flex-1 flex flex-col items-center justify-end group cursor-default"
            style={{ height: BAR_AREA_H + 40 }}
          >
            <p
              className="text-[10px] tabular-nums text-slate-500 group-hover:text-slate-300 transition-colors mb-0.5 leading-none"
              style={{ opacity: barH >= 14 ? 1 : 0 }}
            >
              {m.games}
            </p>

            <div
              className="w-full rounded-t-sm bg-blue-600/50 group-hover:bg-blue-500 transition-colors"
              style={{ height: barH }}
            />

            <div className="mt-1.5 flex flex-col items-center leading-none" style={{ height: 28 }}>
              {showLabel ? (
                <>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">{short}</p>
                  {year ? <p className="text-[9px] text-slate-600">{year}</p> : null}
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthChart;
