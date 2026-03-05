import React, { useEffect, useMemo, useState } from "react";
import { usePaths } from "../../hooks/usePaths";
import { useDialogContext } from "../../contexts/DialogContext";
import { useNavigationUtils } from "../../utils/navigationUtils";
import { useNavigate } from "react-router-dom";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Button, Badge, Input, Select, PageHeader, StatStrip } from "../../components/ui";
import {
  BoardOrientation,
  PathCategory,
} from "@chess-opening-master/common";
import { isStudiedVariantPath, isStudyPath, isNewVariantPath } from "./helpers";
import { getTodayPlanProgress } from "../../utils/path/todayPlanProgress";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { PathLessonView } from "./components/PathLessonViewResponsive";
import { PathForecastView } from "./components/PathForecastViewResponsive";
import { useIsMobile } from "../../hooks/useIsMobile";

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
  const [selectedCategory, setSelectedCategory] = useState<PathCategory | "all">("all");
  const [selectedView, setSelectedView] = useState<PathView>("lesson");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<PathFiltersState>(defaultFilters);

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
      goToRepertoire(path.repertoireId, path.name);
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
  const {
    reviewTargetToday,
    newTargetToday,
    plannedTodayTarget,
    completedReviewsToday,
    completedNewToday,
    completedToday,
    remainingToTarget,
    remainingReviewsTarget,
    remainingNewTarget,
    exceededTarget,
    todayPlanMessage,
  } = useMemo(() => getTodayPlanProgress(plan), [plan]);

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <div className="flex-1 min-h-0 flex flex-col relative overflow-y-auto">
        <div className="w-full mx-auto flex flex-col gap-4 pb-4">
          <PageHeader
            eyebrow={isMobile ? undefined : "Queue"}
            title="Path"
            description={
              isMobile
                ? undefined
                : "Keep the next lesson obvious, then switch to forecast when you need to shape the upcoming workload."
            }
            primaryAction={!isMobile ? (
              <Button intent="primary" size="md" onClick={() => setSelectedView("lesson")}>
                Next lesson
              </Button>
            ) : undefined}
            secondaryActions={!isMobile ? (
              <Button intent="secondary" size="md" onClick={() => setSelectedView("forecast")}>
                Forecast
              </Button>
            ) : undefined}
            meta={!isMobile ? (
              <>
                <Badge variant="warning" size="sm">
                  {plan?.dueTodayCount ?? 0} due today
                </Badge>
                <Badge variant="danger" size="sm">
                  {plan?.overdueCount ?? 0} overdue
                </Badge>
                <Badge variant="brand" size="sm">
                  {plan?.forecastDays?.length ?? 0} forecast days
                </Badge>
              </>
            ) : undefined}
            className={isMobile ? "gap-3 px-4 py-4" : undefined}
          />

          {!isMobile ? (
            <StatStrip
              items={[
                {
                  label: "Target today",
                  value: plannedTodayTarget,
                  tone: "accent",
                  detail: `${completedToday} completed • ${remainingToTarget} remaining`,
                },
                {
                  label: "Reviews",
                  value: reviewTargetToday,
                  tone: "brand",
                  detail: `${completedReviewsToday} done today`,
                },
                {
                  label: "New/day cap",
                  value: apiFilters.dailyNewLimit ?? DEFAULT_DAILY_NEW_LIMIT,
                  tone: "default",
                  detail: `${completedNewToday} new learned today`,
                },
                {
                  label: "Next 7 days",
                  value: nextSevenDueCount,
                  tone: "warning",
                  detail: exceededTarget ? "Ahead of target" : todayPlanMessage,
                },
              ]}
            />
          ) : null}

          <div className="sticky top-0 z-10 rounded-xl border border-border-default bg-surface/95 backdrop-blur p-2 sm:p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                intent={selectedView === "lesson" ? "primary" : "secondary"}
                size="sm"
                className="w-full justify-center"
                onClick={() => setSelectedView("lesson")}
              >
                {isMobile ? "Lesson" : "Next lesson"}
              </Button>
              <Button
                intent={selectedView === "forecast" ? "accent" : "secondary"}
                size="sm"
                className="w-full justify-center"
                onClick={() => setSelectedView("forecast")}
              >
                {isMobile ? "Forecast" : "Path forecast"}
              </Button>
            </div>
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
                <Button
                  type="button"
                  intent="secondary"
                  size="sm"
                  onClick={clearFilters}
                >
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

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-border-default">
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
                <div className="flex flex-col">
                  <label htmlFor="daily-new-limit" className="text-text-muted mb-1 text-sm flex items-center gap-1">
                    <span>Daily new limit</span>
                    <span
                      className="inline-flex items-center justify-center h-4 w-4 rounded-full border border-border-subtle text-text-subtle cursor-help text-[10px]"
                      title="Maximum number of brand-new variants to introduce per day. It does not affect due reviews."
                    >
                      ?
                    </span>
                  </label>
                  <Input
                    id="daily-new-limit"
                    size="sm"
                    value={filters.dailyNewLimit}
                    onChange={(event) => setFilterField("dailyNewLimit", event.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
            )}
          </div>

          {selectedView === "lesson" && (
            <PathLessonView
              path={path}
              loading={loading}
              error={error}
              plan={plan}
              nextSevenDueCount={nextSevenDueCount}
              completedReviewsToday={completedReviewsToday}
              reviewTargetToday={reviewTargetToday}
              completedNewToday={completedNewToday}
              newTargetToday={newTargetToday}
              plannedTodayTarget={plannedTodayTarget}
              completedToday={completedToday}
              remainingToTarget={remainingToTarget}
              remainingReviewsTarget={remainingReviewsTarget}
              remainingNewTarget={remainingNewTarget}
              exceededTarget={exceededTarget}
              todayPlanMessage={todayPlanMessage}
              onGoToReviewVariant={goToReviewVariant}
              onGoToTrainVariant={goToTrainVariant}
              onGoToStudy={goToStudy}
              onRemoveVariant={handleRemoveVariant}
              onSwitchToForecast={() => setSelectedView("forecast")}
            />
          )}

          {selectedView === "forecast" && (
            <PathForecastView
              plan={plan}
              analytics={analytics}
              insightsLoading={insightsLoading}
              loading={loading}
              insightsError={insightsError}
              nextSevenDueCount={nextSevenDueCount}
            />
          )}
          </div>
          </div>
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};

export default PathPage;
