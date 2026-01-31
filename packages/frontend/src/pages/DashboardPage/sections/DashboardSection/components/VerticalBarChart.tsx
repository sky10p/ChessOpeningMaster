import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartMargins, OpeningStats } from "../types";

interface VerticalBarChartProps {
  data: OpeningStats[];
  title: string;
  label: string;
  barName: string;
  barColor: string;
  tooltipValueLabel: string;
  emptyMessage?: string;
  isMobile: boolean;
  yAxisWidth: number;
  barChartMargin: ChartMargins;
  onOpeningClick?: (openingName: string) => void;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  title,
  label,
  barName,
  barColor,
  tooltipValueLabel,
  emptyMessage = "No data",
  isMobile,
  yAxisWidth,
  barChartMargin,
  onOpeningClick,
}) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center overflow-x-auto md:overflow-x-visible">
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {data.length === 0 ? (
        <div className="text-gray-400 text-center py-8">{emptyMessage}</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={barChartMargin}
            barCategoryGap={24}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              allowDecimals={false}
              label={{
                value: label,
                position: "insideBottomRight",
                offset: -5,
                fill: "#cbd5e1",
              }}
            />
            <YAxis
              dataKey="opening"
              type="category"
              width={yAxisWidth}
              tick={({ x, y, payload }) => {
                const name = payload.value;
                const display =
                  name.length > 28 ? name.slice(0, 25) + "…" : name;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={4}
                      textAnchor="end"
                      fill="#cbd5e1"
                      fontSize={isMobile ? 10 : 13}
                      style={{ cursor: onOpeningClick ? "pointer" : "default" }}
                    >
                      {display}
                      {name.length > 28 && <title>{name}</title>}
                    </text>
                  </g>
                );
              }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value} ${tooltipValueLabel}`,
                barName,
              ]}
              labelFormatter={(label: string) => `Opening: ${label}`}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
            <Legend />
            <Bar
              dataKey="count"
              fill={barColor}
              name={barName}
              radius={[6, 6, 6, 6]}
              onClick={(data) => onOpeningClick?.(data.opening)}
              style={{ cursor: onOpeningClick ? "pointer" : "default" }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
