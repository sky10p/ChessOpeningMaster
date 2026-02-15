import { useEffect, useMemo, useState } from "react";
import { PathAnalyticsSummary, PathPlanSummary } from "@chess-opening-master/common";
import {
  fetchPathAnalytics,
  fetchPathPlan,
  PathInsightsFilters,
} from "../../../../../repository/paths/paths";
import { FilterType } from "../types";

interface UsePathInsightsResult {
  pathPlan: PathPlanSummary | null;
  pathAnalytics: PathAnalyticsSummary | null;
  loadingPathInsights: boolean;
  pathInsightsError: string | null;
}

export const DEFAULT_DAILY_NEW_LIMIT = 5;

const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const getDateKeyDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return toDateKey(date);
};

function mapFilterToInsightsFilters(filter: FilterType): PathInsightsFilters {
  const orientation = filter === "white" || filter === "black" ? filter : undefined;
  return {
    orientation,
    dateFrom: getDateKeyDaysAgo(29),
    dateTo: toDateKey(new Date()),
    dailyNewLimit: DEFAULT_DAILY_NEW_LIMIT,
  };
}

export function usePathInsights(filter: FilterType): UsePathInsightsResult {
  const [pathPlan, setPathPlan] = useState<PathPlanSummary | null>(null);
  const [pathAnalytics, setPathAnalytics] = useState<PathAnalyticsSummary | null>(null);
  const [loadingPathInsights, setLoadingPathInsights] = useState(false);
  const [pathInsightsError, setPathInsightsError] = useState<string | null>(null);

  const insightFilters = useMemo(() => mapFilterToInsightsFilters(filter), [filter]);

  useEffect(() => {
    let ignore = false;
    setLoadingPathInsights(true);
    setPathInsightsError(null);

    Promise.all([
      fetchPathPlan(insightFilters),
      fetchPathAnalytics(insightFilters),
    ])
      .then(([nextPlan, nextAnalytics]) => {
        if (ignore) {
          return;
        }
        setPathPlan(nextPlan);
        setPathAnalytics(nextAnalytics);
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }
        setPathInsightsError(error instanceof Error ? error.message : "Failed to load spaced-repetition insights");
      })
      .finally(() => {
        if (!ignore) {
          setLoadingPathInsights(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [insightFilters]);

  return {
    pathPlan,
    pathAnalytics,
    loadingPathInsights,
    pathInsightsError,
  };
}
