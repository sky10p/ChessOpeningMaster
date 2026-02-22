import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ReviewDataItem } from "../types";

interface VariantsReviewStatusChartProps {
  data: ReviewDataItem[];
}

const COLORS = ["#f59e42", "#ef4444", "#22c55e"];

export const VariantsReviewStatusChart: React.FC<VariantsReviewStatusChartProps> = ({
  data,
}) => {
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
      <h3 className="text-lg font-semibold text-text-muted mb-2">
        Variants Review Status
      </h3>
      {!hasData ? (
        <div className="text-text-subtle text-center py-8">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
