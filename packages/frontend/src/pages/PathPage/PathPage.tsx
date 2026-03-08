import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { BoardOrientation, PathCategory } from "@chess-opening-master/common";
import { usePaths } from "../../hooks/usePaths";
import { useDialogContext } from "../../contexts/DialogContext";
import { useNavigationUtils } from "../../utils/navigationUtils";
import { Button, Badge, Input, Select, PageHeader, Tabs, TabButton } from "../../components/ui";
import { getPathSurfaceModel } from "../../utils/path/pathSurfaceModel";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { PathLessonView } from "./components/PathLessonViewResponsive";
import { PathForecastView } from "./components/PathForecastViewResponsive";
import { useIsMobile } from "../../hooks/useIsMobile";
import { isNewVariantPath, isStudiedVariantPath, isStudyPath } from "./helpers";

type FilterOrientation = BoardOrientation | "all";
type PathView = "lesson" | "forecast";

type PathFiltersState = {
  orientation: FilterOrientation;
  openingName: string;
  fen: string;
  dateFrom: string;
  dateTo: string;
  dailyNewLimit: string;
};

const DEFAULT_DAILY_NEW_LIMIT = 5;

const getTodayDateKey = (): string => new Date().toISOString().slice(0, 10);

const getDateKeyDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

const toNumberOrUndefined = (value: string): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
};

const defaultFilters = (): PathFiltersState => ({
  orientation: "all",
  openingName: "",
  fen: "",
  dateFrom: getDateKeyDaysAgo(29),
  dateTo: getTodayDateKey(),
  dailyNewLimit: String(DEFAULT_DAILY_NEW_LIMIT),
});

const categoryLabels: Record<PathCategory | "all", string> = {
  all: "All paths",
  variantsWithErrors: "With errors",
  newVariants: "New variants",
  oldVariants: "Old variants",
  studyToReview: "Study reviews",
};

const resolveView = (value: string | null): PathView => (value === "lesson" ? "lesson" : "forecast");

const PathPage: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    path,
    loading,
    error,
    loadPath,
    removeVariantFromPath,
    plan,
    analytics,
    insightsLoading,
    insightsError,
    loadInsights,
  } = usePaths();
  const { showConfirmDialog } = useDialogContext();
  const { goToRepertoire, goToTrainRepertoire } = useNavigationUtils();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<PathCategory | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<PathFiltersState>(defaultFilters);

  const selectedView = resolveView(searchParams.get("view"));

  const apiFilters = useMemo(
    () => ({
      orientation: filters.orientation === "all" ? undefined : filters.orientation,
      openingName: filters.openingName.trim() || undefined,
      fen: filters.fen.trim() || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      dailyNewLimit: toNumberOrUndefined(filters.dailyNewLimit),
    }),
    [filters]
  );

  const activeFilterTags = useMemo(() => {
    const tags: string[] = [];
    if (selectedCategory !== "all") {
      tags.push(`Type: ${categoryLabels[selectedCategory]}`);
    }
    if (apiFilters.orientation) {
      tags.push(`Color: ${apiFilters.orientation}`);
    }
    if (apiFilters.openingName) {
      tags.push(`Opening: ${apiFilters.openingName}`);
    }
    if (apiFilters.fen) {
      tags.push("FEN filter");
    }
    if (
      apiFilters.dailyNewLimit !== undefined &&
      apiFilters.dailyNewLimit !== DEFAULT_DAILY_NEW_LIMIT
    ) {
      tags.push(`New/day cap: ${apiFilters.dailyNewLimit}`);
    }
    return tags;
  }, [selectedCategory, apiFilters]);

  const hasActiveFilters = useMemo(() => {
    const defaults = defaultFilters();

    return (
      selectedCategory !== "all" ||
      filters.orientation !== defaults.orientation ||
      filters.openingName.trim() !== defaults.openingName ||
      filters.fen.trim() !== defaults.fen ||
      filters.dateFrom !== defaults.dateFrom ||
      filters.dateTo !== defaults.dateTo ||
      filters.dailyNewLimit !== defaults.dailyNewLimit
    );
  }, [filters, selectedCategory]);

  useEffect(() => {
    const categoryForApi = selectedCategory === "all" ? undefined : (selectedCategory as PathCategory);
    void loadPath(categoryForApi, apiFilters);
    void loadInsights(apiFilters);
  }, [loadInsights, loadPath, selectedCategory, apiFilters]);

  const handleSelectView = useCallback(
    (view: PathView) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set("view", view);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const goToStudy = () => {
    if (isStudyPath(path)) {
      navigate(`/studies?groupId=${encodeURIComponent(path.groupId)}&studyId=${encodeURIComponent(path.studyId)}`);
    }
  };

  const goToTrainVariant = () => {
    if (isStudiedVariantPath(path) || isNewVariantPath(path)) {
      goToTrainRepertoire(path.repertoireId, path.name);
    }
  };

  const goToReviewVariant = () => {
    if (isStudiedVariantPath(path) || isNewVariantPath(path)) {
      goToRepertoire(path.repertoireId, path.name, path.startingFen);
    }
  };

  const handleRemoveVariant = async () => {
    if (isStudiedVariantPath(path)) {
      showConfirmDialog({
        title: "Remove Variant from Path",
        contentText: `Are you sure you want to remove "${path.name}" from your learning path? This will reset all training progress for this variant and it will no longer appear in your spaced repetition schedule.`,
        confirmLabel: "Remove",
        confirmIntent: "danger",
        onConfirm: async () => {
          await removeVariantFromPath(path.id);
        },
      });
    }
  };

  const setFilterField = <K extends keyof PathFiltersState>(field: K, value: PathFiltersState[K]) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters());
    setSelectedCategory("all");
  };

  const nextSevenDueCount = (plan?.forecastDays || []).slice(0, 7).reduce((sum, entry) => sum + entry.dueCount, 0);
  const surfaceModel = useMemo(() => getPathSurfaceModel(path, plan, loading), [path, plan, loading]);

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <div className="flex min-h-0 flex-1 flex-col gap-4 pb-4">
            <PageHeader
              eyebrow={isMobile ? undefined : "Path"}
              title="Path"
              description={
                isMobile
                  ? undefined
                  : "Use forecast to shape the queue, then switch to next lesson when you are ready to execute."
              }
              className={isMobile ? "gap-3 px-4 py-4" : undefined}
            />

            <div className="sticky top-0 z-10 space-y-3 rounded-xl border border-border-default bg-surface/95 p-2 backdrop-blur sm:p-3">
              <Tabs variant="segment" className="w-full">
                <TabButton
                  variant="segment"
                  active={selectedView === "forecast"}
                  onClick={() => handleSelectView("forecast")}
                >
                  Path forecast
                </TabButton>
                <TabButton
                  variant="segment"
                  active={selectedView === "lesson"}
                  onClick={() => handleSelectView("lesson")}
                >
                  Next lesson
                </TabButton>
              </Tabs>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center">
                  <Select
                    id="category-select"
                    size="sm"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value as PathCategory | "all")}
                  >
                    <option value="all">All Paths</option>
                    <option value="variantsWithErrors">Variants with Errors</option>
                    <option value="newVariants">New Variants</option>
                    <option value="oldVariants">Old Variants</option>
                    <option value="studyToReview">Studies to Review</option>
                  </Select>
                  <Button
                    type="button"
                    intent="secondary"
                    size="sm"
                    onClick={() => setShowAdvancedFilters((previousValue) => !previousValue)}
                  >
                    <FunnelIcon className="h-4 w-4" />
                    {isMobile ? "Filters" : showAdvancedFilters ? "Hide filters" : "Show filters"}
                  </Button>
                </div>
                {!isMobile ? (
                  <Button type="button" intent="secondary" size="sm" onClick={clearFilters}>
                    Reset scope
                  </Button>
                ) : null}
              </div>

              {(activeFilterTags.length > 0 || (isMobile && hasActiveFilters)) ? (
                <div className="space-y-2">
                  {activeFilterTags.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {activeFilterTags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm" className="whitespace-nowrap">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {isMobile && hasActiveFilters ? (
                    <Button
                      type="button"
                      intent="secondary"
                      size="sm"
                      className="w-full justify-center"
                      onClick={clearFilters}
                    >
                      Reset scope
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {showAdvancedFilters ? (
                <div className="grid grid-cols-1 gap-3 border-t border-border-default pt-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Select
                    id="orientation-filter"
                    label="Color"
                    size="sm"
                    value={filters.orientation}
                    onChange={(event) => setFilterField("orientation", event.target.value as FilterOrientation)}
                  >
                    <option value="all">All</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                  </Select>
                  <Input
                    id="opening-filter"
                    label="Opening"
                    size="sm"
                    value={filters.openingName}
                    onChange={(event) => setFilterField("openingName", event.target.value)}
                    placeholder="e.g. Sicilian"
                  />
                  <Input
                    id="fen-filter"
                    label="FEN contains"
                    size="sm"
                    value={filters.fen}
                    onChange={(event) => setFilterField("fen", event.target.value)}
                    placeholder="piece placement..."
                  />
                  <Input
                    id="date-from"
                    label="Analytics from"
                    type="date"
                    size="sm"
                    value={filters.dateFrom}
                    onChange={(event) => setFilterField("dateFrom", event.target.value)}
                  />
                  <Input
                    id="date-to"
                    label="Analytics to"
                    type="date"
                    size="sm"
                    value={filters.dateTo}
                    onChange={(event) => setFilterField("dateTo", event.target.value)}
                  />
                  <Input
                    id="daily-new-limit"
                    label="Daily new limit"
                    size="sm"
                    value={filters.dailyNewLimit}
                    onChange={(event) => setFilterField("dailyNewLimit", event.target.value)}
                    placeholder="5"
                  />
                </div>
              ) : null}
            </div>

            {selectedView === "forecast" ? (
              <PathForecastView
                plan={plan}
                analytics={analytics}
                insightsLoading={insightsLoading}
                loading={loading}
                insightsError={insightsError}
                nextSevenDueCount={nextSevenDueCount}
              />
            ) : (
              <PathLessonView
                path={path}
                loading={loading}
                error={error}
                nextAction={surfaceModel.nextAction}
                onGoToReviewVariant={goToReviewVariant}
                onGoToTrainVariant={goToTrainVariant}
                onGoToStudy={goToStudy}
                onRemoveVariant={handleRemoveVariant}
              />
            )}
          </div>
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};

export default PathPage;
