import React from "react";
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Input, Select } from "../../../components/ui";
import { useIsMobile } from "../../../hooks/useIsMobile";
import {
  AvailabilityFilter,
  FavoritesFilter,
  getActiveFilterLabels,
  MasteryFilter,
  OrientationFilter,
  StatusFilter,
} from "../repertoireOverviewFilters";

interface RepertoireOverviewFiltersProps {
  query: string;
  orientation: OrientationFilter;
  status: StatusFilter;
  availability: AvailabilityFilter;
  favorites: FavoritesFilter;
  mastery: MasteryFilter;
  onQueryChange: (value: string) => void;
  onOrientationChange: (value: OrientationFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  onFavoritesChange: (value: FavoritesFilter) => void;
  onMasteryChange: (value: MasteryFilter) => void;
  onClearFilters: () => void;
}

export const RepertoireOverviewFilters: React.FC<RepertoireOverviewFiltersProps> = ({
  query,
  orientation,
  status,
  availability,
  favorites,
  mastery,
  onQueryChange,
  onOrientationChange,
  onStatusChange,
  onAvailabilityChange,
  onFavoritesChange,
  onMasteryChange,
  onClearFilters,
}) => {
  const isMobile = useIsMobile();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const activeFilters = React.useMemo(
    () =>
      getActiveFilterLabels({
        orientation,
        status,
        availability,
        favorites,
        mastery,
      }),
    [availability, favorites, mastery, orientation, status]
  );

  const activeFilterCount = activeFilters.length;
  const advancedLabel = showAdvanced ? "Hide filters" : "More filters";

  React.useEffect(() => {
    if (!isMobile && activeFilterCount > 0) {
      setShowAdvanced(true);
    }
  }, [activeFilterCount, isMobile]);

  return (
    <div className="shrink-0 border-b border-border-subtle bg-surface px-4 py-3 sm:px-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <Input
              label="Search"
              size="sm"
              placeholder="Repertoire or opening"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:pb-0.5">
            <Button
              intent={showAdvanced ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced((current) => !current)}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              {advancedLabel}
              {activeFilterCount > 0 ? (
                <Badge variant="brand" size="sm" className="ml-1">
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
            {(activeFilterCount > 0 || query.trim().length > 0) ? (
              <Button intent="ghost" size="sm" onClick={onClearFilters}>
                <XMarkIcon className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {(activeFilterCount > 0 || query.trim().length > 0) && (
          <div className="flex flex-wrap gap-2">
            {query.trim().length > 0 ? (
              <Badge variant="default" size="sm" className="bg-surface-raised text-text-base">
                Search: {query.trim()}
              </Badge>
            ) : null}
            {activeFilters.map((item) => (
              <Badge key={item} variant="brand" size="sm" className="bg-brand-subtle text-brand">
                {item}
              </Badge>
            ))}
          </div>
        )}

        {showAdvanced && (
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Select
                label="Color"
                size="sm"
                value={orientation}
                onChange={(event) => onOrientationChange(event.target.value as OrientationFilter)}
              >
                <option value="all">All</option>
                <option value="white">White</option>
                <option value="black">Black</option>
              </Select>
              <Select
                label="Status"
                size="sm"
                value={status}
                onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
              >
                <option value="all">All</option>
                <option value="errors">With Errors</option>
                <option value="successful">Successful</option>
                <option value="new">New</option>
              </Select>
              <Select
                label="Availability"
                size="sm"
                value={availability}
                onChange={(event) => onAvailabilityChange(event.target.value as AvailabilityFilter)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </Select>
              <Select
                label="Favorites"
                size="sm"
                value={favorites}
                onChange={(event) => onFavoritesChange(event.target.value as FavoritesFilter)}
              >
                <option value="all">All</option>
                <option value="only">Favorites only</option>
              </Select>
              <Select
                label="Mastery"
                size="sm"
                value={mastery}
                onChange={(event) => onMasteryChange(event.target.value as MasteryFilter)}
              >
                <option value="all">All</option>
                <option value="0-24">0-24%</option>
                <option value="25-49">25-49%</option>
                <option value="50-74">50-74%</option>
                <option value="75-100">75-100%</option>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
