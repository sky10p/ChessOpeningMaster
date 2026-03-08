import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { useChartColors } from "../../../hooks/useChartColors";

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

const formatMonthLabel = (month: string): string => {
  const { short, year } = parseMonthLabel(month);
  return year ? `${short} ${year}` : short;
};

type MonthChartProps = {
  gamesByMonth: Array<{ month: string; games: number }>;
};

type MonthTickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  tickFill: string;
};

const MonthTick: React.FC<MonthTickProps> = ({ x = 0, y = 0, payload, tickFill }) => {
  if (!payload) {
    return null;
  }

  const { short, year } = parseMonthLabel(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill={tickFill} fontSize={11}>
        {short}
      </text>
      {year ? (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="var(--color-text-subtle)" fontSize={10}>
          {year}
        </text>
      ) : null}
    </g>
  );
};

const MonthChart: React.FC<MonthChartProps> = ({ gamesByMonth }) => {
  const { tickFill } = useChartColors();

  if (gamesByMonth.length === 0) {
    return <p className="text-sm text-text-subtle">No data for current filters.</p>;
  }

  const tickInterval = gamesByMonth.length > 18 ? 2 : gamesByMonth.length > 9 ? 1 : 0;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={gamesByMonth} margin={{ top: 20, right: 8, left: -20, bottom: 28 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
            height={40}
            tick={(props) => <MonthTick {...props} tickFill={tickFill} />}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={32}
            tick={{ fill: tickFill, fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} games`, "Games"]}
            labelFormatter={(label: string) => `Month: ${formatMonthLabel(label)}`}
            cursor={{ fill: "var(--color-brand-soft)" }}
            contentStyle={{
              backgroundColor: "var(--color-bg-surface-raised)",
              borderColor: "var(--color-border-default)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-surface)",
              color: "var(--color-text-base)",
            }}
            labelStyle={{ color: "var(--color-text-base)" }}
          />
          <Bar dataKey="games" fill="var(--color-brand)" radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive={false}>
            <LabelList dataKey="games" position="top" fill="var(--color-text-base)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthChart;
