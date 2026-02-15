import { useCallback, useState } from "react";
import {
  deleteVariantFromPath,
  fetchPath,
  fetchPathAnalytics,
  fetchPathPlan,
  PathInsightsFilters,
} from "../repository/paths/paths";
import { Path, PathAnalyticsSummary, PathCategory, PathPlanSummary } from "@chess-opening-master/common";

export function usePaths() {
  const [path, setPath] = useState<Path | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<PathCategory | undefined>(undefined);
  const [filters, setFilters] = useState<PathInsightsFilters>({});
  const [plan, setPlan] = useState<PathPlanSummary | null>(null);
  const [analytics, setAnalytics] = useState<PathAnalyticsSummary | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const loadPath = useCallback(async (selectedCategory?: PathCategory, selectedFilters?: PathInsightsFilters) => {
    setLoading(true);
    setError(null);
    
    const categoryToUse = selectedCategory !== undefined ? selectedCategory : category;
    const filtersToUse = selectedFilters !== undefined ? selectedFilters : filters;
    
    try {
      if (selectedCategory !== undefined) {
        setCategory(selectedCategory);
      }
      if (selectedFilters !== undefined) {
        setFilters(selectedFilters);
      }

      const data = await fetchPath(categoryToUse, filtersToUse);
      setPath(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load path");
    } finally {
      setLoading(false);
    }
  }, [category, filters]);

  const loadInsights = useCallback(async (selectedFilters?: PathInsightsFilters) => {
    setInsightsLoading(true);
    setInsightsError(null);
    const filtersToUse = selectedFilters !== undefined ? selectedFilters : filters;
    try {
      if (selectedFilters !== undefined) {
        setFilters(selectedFilters);
      }
      const [nextPlan, nextAnalytics] = await Promise.all([
        fetchPathPlan(filtersToUse),
        fetchPathAnalytics(filtersToUse),
      ]);
      setPlan(nextPlan);
      setAnalytics(nextAnalytics);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : "Failed to load path insights");
    } finally {
      setInsightsLoading(false);
    }
  }, [filters]);

  const removeVariantFromPath = useCallback(async (variantId: string) => {
    if (!variantId) {
      console.warn("removeVariantFromPath called with a falsy variantId");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await deleteVariantFromPath(variantId);
      await loadPath(undefined, filters); // Reload path data after removal
      await loadInsights(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove variant from path");
    } finally {
      setLoading(false);
    }
  }, [filters, loadInsights, loadPath]);

  return {
    path,
    loading,
    error,
    loadPath,
    removeVariantFromPath,
    category,
    setCategory,
    filters,
    setFilters,
    plan,
    analytics,
    insightsLoading,
    insightsError,
    loadInsights,
  };
}
