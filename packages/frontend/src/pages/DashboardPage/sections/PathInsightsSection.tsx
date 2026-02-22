import React, { useState } from "react";
import { SpacedRepetitionInsightsPanel } from "./DashboardSection/components";
import {
  DEFAULT_DAILY_NEW_LIMIT,
  usePathInsights,
} from "./DashboardSection/hooks/usePathInsights";
import { FilterType } from "./DashboardSection/types";

type PathInsightsFilter = "all" | "white" | "black";

const FILTER_OPTIONS: Array<{ value: PathInsightsFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "white", label: "Only White" },
  { value: "black", label: "Only Black" },
];

export const PathInsightsSection: React.FC = () => {
  const [filter, setFilter] = useState<PathInsightsFilter>("all");
  const {
    pathPlan,
    pathAnalytics,
    loadingPathInsights,
    pathInsightsError,
  } = usePathInsights(filter as FilterType);

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <header className="mb-4">
        <h2 className="font-bold text-text-base text-2xl leading-tight mb-1">
          Path Insights
        </h2>
        <p className="text-text-muted text-base leading-snug mb-2">
          Forecast your review queue, quality trends, and upcoming openings.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1 rounded ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "bg-surface-raised text-text-muted hover:bg-interactive"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <SpacedRepetitionInsightsPanel
        plan={pathPlan}
        analytics={pathAnalytics}
        loading={loadingPathInsights}
        error={pathInsightsError}
        dailyNewLimit={DEFAULT_DAILY_NEW_LIMIT}
      />
    </section>
  );
};
