import React from "react";
import { defaultFilters } from "../constants";
import { GlobalFilterState } from "../types";
import { toGamesFiltersQuery } from "../utils";

export const useGamesFilters = () => {
  const [filtersDraft, setFiltersDraft] = React.useState<GlobalFilterState>(defaultFilters);
  const [filtersApplied, setFiltersApplied] = React.useState<GlobalFilterState>(defaultFilters);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const applyFilters = React.useCallback(() => {
    setFiltersApplied(filtersDraft);
  }, [filtersDraft]);

  const applyFiltersMobile = React.useCallback(() => {
    setFiltersApplied(filtersDraft);
    setShowMobileFilters(false);
  }, [filtersDraft]);

  const resetFilters = React.useCallback(() => {
    setFiltersDraft(defaultFilters);
    setFiltersApplied(defaultFilters);
    setShowMobileFilters(false);
  }, []);

  const activeFiltersCount = React.useMemo(() => [
    filtersApplied.source !== "all",
    filtersApplied.color !== "all",
    filtersApplied.mapped !== "all",
    filtersApplied.timeControlBucket !== "all",
    Boolean(filtersApplied.openingQuery.trim()),
    Boolean(filtersApplied.dateFrom),
    Boolean(filtersApplied.dateTo),
  ].filter(Boolean).length, [filtersApplied]);

  const appliedQuery = React.useMemo(() => toGamesFiltersQuery(filtersApplied), [filtersApplied]);

  return {
    filtersDraft,
    filtersApplied,
    showMobileFilters,
    setFiltersDraft,
    setShowMobileFilters,
    applyFilters,
    applyFiltersMobile,
    resetFilters,
    activeFiltersCount,
    appliedQuery,
  };
};
