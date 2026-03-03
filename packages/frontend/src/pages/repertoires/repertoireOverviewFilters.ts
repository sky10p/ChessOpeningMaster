import {
  RepertoireOverviewItem,
  RepertoireOverviewOpening,
} from "@chess-opening-master/common";

export type StatusFilter = "all" | "errors" | "successful" | "new";
export type AvailabilityFilter = "all" | "active" | "disabled";
export type FavoritesFilter = "all" | "only";
export type OrientationFilter = "all" | "white" | "black";
export type MasteryFilter = "all" | "0-24" | "25-49" | "50-74" | "75-100";

export type RepertoireOverviewFilterState = {
  query: string;
  orientation: OrientationFilter;
  status: StatusFilter;
  availability: AvailabilityFilter;
  favorites: FavoritesFilter;
  mastery: MasteryFilter;
};

export const DEFAULT_REPERTOIRE_OVERVIEW_FILTERS: RepertoireOverviewFilterState = {
  query: "",
  orientation: "all",
  status: "all",
  availability: "all",
  favorites: "all",
  mastery: "all",
};

export const parseOrientationFilter = (value: string | null): OrientationFilter =>
  value === "white" || value === "black" ? value : "all";

export const parseStatusFilter = (value: string | null): StatusFilter =>
  value === "errors" || value === "successful" || value === "new" ? value : "all";

export const parseAvailabilityFilter = (value: string | null): AvailabilityFilter =>
  value === "active" || value === "disabled" ? value : "all";

export const parseFavoritesFilter = (value: string | null): FavoritesFilter =>
  value === "only" ? "only" : "all";

export const parseMasteryFilter = (value: string | null): MasteryFilter =>
  value === "0-24" ||
  value === "25-49" ||
  value === "50-74" ||
  value === "75-100"
    ? value
    : "all";

export const matchesMasteryRange = (masteryScore: number, mastery: MasteryFilter): boolean => {
  if (mastery === "all") {
    return true;
  }
  if (mastery === "0-24") {
    return masteryScore >= 0 && masteryScore <= 24;
  }
  if (mastery === "25-49") {
    return masteryScore >= 25 && masteryScore <= 49;
  }
  if (mastery === "50-74") {
    return masteryScore >= 50 && masteryScore <= 74;
  }
  return masteryScore >= 75 && masteryScore <= 100;
};

export const matchesOpeningStatus = (
  opening: RepertoireOverviewOpening,
  status: StatusFilter
): boolean => {
  const errorCount =
    opening.statusCounts.oneError +
    opening.statusCounts.twoErrors +
    opening.statusCounts.moreThanTwoErrors;

  if (status === "all") {
    return true;
  }
  if (status === "errors") {
    return errorCount > 0;
  }
  if (status === "successful") {
    return (
      opening.statusCounts.total > 0 &&
      errorCount === 0 &&
      opening.statusCounts.unresolved === 0
    );
  }
  return opening.statusCounts.unresolved > 0;
};

export const applyRepertoireOverviewFilters = (
  repertoires: RepertoireOverviewItem[],
  filters: RepertoireOverviewFilterState
): RepertoireOverviewItem[] => {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return repertoires
    .filter((repertoire) => {
      if (filters.orientation !== "all" && repertoire.orientation !== filters.orientation) {
        return false;
      }
      if (filters.availability === "active" && repertoire.disabled) {
        return false;
      }
      if (filters.availability === "disabled" && !repertoire.disabled) {
        return false;
      }
      if (filters.favorites === "only" && !repertoire.favorite) {
        return false;
      }
      return true;
    })
    .map((repertoire) => {
      const repertoireMatchesQuery =
        normalizedQuery.length === 0 ||
        repertoire.repertoireName.toLowerCase().includes(normalizedQuery);

      const openings = repertoire.openings.filter((opening) => {
        if (!matchesOpeningStatus(opening, filters.status)) {
          return false;
        }
        if (!matchesMasteryRange(opening.masteryScore, filters.mastery)) {
          return false;
        }
        if (repertoireMatchesQuery) {
          return true;
        }
        return opening.openingName.toLowerCase().includes(normalizedQuery);
      });

      return {
        ...repertoire,
        openings,
      };
    })
    .filter((repertoire) => repertoire.openings.length > 0);
};

export const getActiveFilterLabels = (
  filters: Pick<
    RepertoireOverviewFilterState,
    "orientation" | "status" | "availability" | "favorites" | "mastery"
  >
): string[] => {
  const items: string[] = [];

  if (filters.orientation !== "all") {
    items.push(filters.orientation === "white" ? "White" : "Black");
  }
  if (filters.status !== "all") {
    items.push(
      filters.status === "errors"
        ? "With errors"
        : filters.status === "successful"
          ? "Successful"
          : "New"
    );
  }
  if (filters.availability !== "all") {
    items.push(filters.availability === "active" ? "Active" : "Disabled");
  }
  if (filters.favorites !== "all") {
    items.push("Favorites only");
  }
  if (filters.mastery !== "all") {
    items.push(`${filters.mastery}% mastery`);
  }

  return items;
};
