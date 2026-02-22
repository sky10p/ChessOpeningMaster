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
import { ReviewActivityItem } from "../types";

interface ReviewActivityChartProps {
  data: ReviewActivityItem[];
  hasActivity: boolean;
}

export const ReviewActivityChart: React.FC<ReviewActivityChartProps> = ({
  data,
  hasActivity,
}) => {
  return (
    <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
      <h3 className="text-lg font-semibold text-text-muted mb-2">
        Review Activity Over Time (10 days)
      </h3>
      {!hasActivity ? (
        <div className="text-text-subtle text-center py-8">
          No review activity in the last 10 days
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Reviewed" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
