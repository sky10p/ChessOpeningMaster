import React, { useState } from "react";
import { SpacedRepetitionInsightsPanel } from "./DashboardSection/components";
import {
  DEFAULT_DAILY_NEW_LIMIT,
  usePathInsights,
} from "./DashboardSection/hooks/usePathInsights";
import { FilterType } from "./DashboardSection/types";
import { Button } from "../../../components/ui";

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
            <Button
              key={value}
              intent={filter === value ? "primary" : "secondary"}
              size="xs"
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
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
