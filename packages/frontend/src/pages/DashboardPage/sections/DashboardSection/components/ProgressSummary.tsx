import React from "react";
import { ProgressStats } from "../types";

interface ProgressSummaryProps {
  stats: ProgressStats;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ stats }) => {
  return (
    <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
      <h3 className="text-lg font-semibold text-text-muted mb-3">
        Progress Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-warning">
            {stats.neverReviewed}
          </span>
          <span className="text-text-muted mt-1 text-sm text-center">
            Overall Unreviewed
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-danger">
            {stats.reviewedWithErrors}
          </span>
          <span className="text-text-muted mt-1 text-sm">Overall Errors</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-brand">
            {stats.reviewedToday}
          </span>
          <span className="text-text-muted mt-1 text-sm">Reviewed Today</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-danger">
            {stats.reviewedTodayErrors}
          </span>
          <span className="text-text-muted mt-1 text-sm">Errors Today</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-success">
            {stats.reviewedTodayOk}
          </span>
          <span className="text-text-muted mt-1 text-sm">OK Today</span>
        </div>
      </div>
    </div>
  );
};
