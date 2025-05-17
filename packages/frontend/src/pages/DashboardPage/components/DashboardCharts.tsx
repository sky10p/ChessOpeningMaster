import React from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
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
import { MoveVariantNode } from "../../../models/VariantNode";

export type FilterType = "all" | "white" | "black" | "errors" | "unreviewed";
export type VariantInfo = { errors?: number; lastDate?: string | Date };

export const getRelevantVariants = (
  rep: IRepertoireDashboard,
  filter: FilterType
) => {
  if (!rep.moveNodes) return [];

  const variants = MoveVariantNode.initMoveVariantNode(
    rep.moveNodes
  ).getVariants();

  if (filter === "unreviewed") {
    return variants.filter((variant) => {
      const info = findVariantInfo(variant, rep);
      return !info || !info.lastDate;
    });
  }

  return variants;
};

export const findVariantInfo = (
  variant: { fullName: string },
  rep: IRepertoireDashboard
): VariantInfo | undefined => {
  return (rep.variantsInfo || []).find(
    (i) => i.variantName === variant.fullName
  );
};

export const generateOpeningStats = (
  filteredRepertoires: IRepertoireDashboard[],
  filter: FilterType,
  statType: "errors" | "mastered",
  topCount = 5
) => {
  const statsMap: Record<string, number> = {};

  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, filter);

    relevantVariants.forEach((variant) => {
      const info = findVariantInfo(variant, rep);
      if (statType === "errors") {
        if (info && (info.errors ?? 0) > 0) {
          statsMap[variant.name] =
            (statsMap[variant.name] || 0) + (info.errors ?? 0);
        }
      } else if (statType === "mastered") {
        if (info && info.lastDate && (info.errors ?? 0) === 0) {
          statsMap[variant.name] = (statsMap[variant.name] || 0) + 1;
        }
      }
    });
  });

  return Object.entries(statsMap)
    .map(([opening, count]) => ({ opening, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topCount);
};

export interface VerticalBarChartProps {
  data: Array<{ opening: string; count: number }>;
  title: string;
  label: string;
  barName: string;
  barColor: string;
  tooltipValueLabel: string;
  emptyMessage?: string;
  isMobile: boolean;
  yAxisWidth: number;
  barChartMargin: { top: number; right: number; left: number; bottom: number };
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
            />
            <Legend />
            <Bar
              dataKey="count"
              fill={barColor}
              name={barName}
              radius={[6, 6, 6, 6]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
