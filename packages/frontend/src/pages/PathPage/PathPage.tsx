import React, { useEffect, useMemo, useState } from "react";
import { usePaths } from "../../hooks/usePaths";
import { useDialogContext } from "../../contexts/DialogContext";
import { useNavigationUtils } from "../../utils/navigationUtils";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  FunnelIcon,
  QuestionMarkCircleIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BoardOrientation,
  PathCategory,
  PathForecastDay,
  PathNamedCount,
  ReviewRating,
} from "@chess-opening-master/common";
import { isEmptyPath, isNewVariantPath, isStudiedVariantPath, isStudyPath } from "./helpers";
import { getTodayPlanProgress } from "./todayPlanProgress";

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

const formatDate = (date: string | Date): string => {
  const newDate = new Date(date);
  return newDate.toISOString().slice(0, 10);
};

const formatShortDate = (date: string): string => date.slice(5);

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

const ratingOrder: ReviewRating[] = ["again", "hard", "good", "easy"];

const ratingColorClass: Record<ReviewRating, string> = {
  again: "text-red-300",
  hard: "text-orange-300",
  good: "text-emerald-300",
  easy: "text-blue-300",
};

interface MetricInfoTooltipProps {
  text: string;
}

const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({ text }) => (
  <span className="group relative inline-flex items-center">
    <button
      type="button"
      aria-label="Metric info"
      title="Metric info"
      className="text-gray-500 hover:text-gray-300 focus:outline-none"
    >
      <QuestionMarkCircleIcon className="h-4 w-4" />
    </button>
    <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-64 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-200 shadow-xl group-hover:block group-focus-within:block">
      {text}
    </span>
  </span>
);

interface MetricTitleProps {
  label: string;
  helpText: string;
}

const MetricTitle: React.FC<MetricTitleProps> = ({ label, helpText }) => (
  <div className="text-xs text-gray-400 flex items-center gap-1">
    <span>{label}</span>
    <MetricInfoTooltip text={helpText} />
  </div>
);

const PathPage: React.FC = () => {
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

  const forecastDays = plan?.forecastDays || [];
  const nextVariants = plan?.nextVariants || [];
  const upcomingOpenings = plan?.upcomingOpenings || [];
  const maxForecastDayLoad = Math.max(...forecastDays.map((entry) => entry.dueCount), 1);
  const nextSevenDueCount = forecastDays.slice(0, 7).reduce((sum, entry) => sum + entry.dueCount, 0);
  const hasForecastLoad = forecastDays.some((entry) => entry.dueCount > 0);
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

  const renderTopNamedCounts = (entries: PathNamedCount[], emptyMessage: string) => {
    if (entries.length === 0) {
      return <div className="text-gray-500 text-sm">{emptyMessage}</div>;
    }
    return (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.name} className="flex justify-between text-sm">
            <span className="text-gray-300 truncate pr-3">{entry.name}</span>
            <span className="text-blue-300 font-semibold">{entry.count}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLessonCard = () => {
    if (loading) {
      return <div className="text-blue-400 animate-pulse text-center">Loading your next lesson...</div>;
    }
    if (error) {
      return <div className="text-red-500 text-center">{error}</div>;
    }
    if (!path) {
      return <div className="text-gray-400">No lesson available.</div>;
    }

    if (isStudiedVariantPath(path)) {
      return (
        <>
          <BookOpenIcon className="h-8 w-8 text-blue-400 mb-2" />
          <div className="font-semibold text-lg text-blue-300 mb-1 text-center">
            Repertoire to review: {path.repertoireName}
          </div>
          <div className="text-gray-100 mb-1">
            <span className="font-medium">Name:</span> {path.name}
          </div>
          <div className="text-gray-300 mb-1">
            <span className="font-medium">Errors:</span> {path.errors}
          </div>
          <div className="text-gray-300 mb-1">
            <span className="font-medium">Last Reviewed:</span> {formatDate(path.lastDate)}
          </div>
          {path.dueAt && (
            <div className="text-gray-300 mb-1">
              <span className="font-medium">Due At:</span> {formatDate(path.dueAt)}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold w-full"
              onClick={goToReviewVariant}
            >
              Start Review
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold w-full"
              onClick={goToTrainVariant}
            >
              Start Training
            </button>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center justify-center gap-2 w-full"
            onClick={handleRemoveVariant}
          >
            <XMarkIcon className="h-5 w-5" />
            Remove this variant from path
          </button>
        </>
      );
    }

    if (isNewVariantPath(path)) {
      return (
        <>
          <BookOpenIcon className="h-8 w-8 text-blue-400 mb-2" />
          <div className="font-semibold text-lg text-blue-300 mb-1 text-center">
            New Repertoire to learn: {path.repertoireName}
          </div>
          <div className="text-gray-100 mb-1">
            <span className="font-medium">Name:</span> {path.name}
          </div>
          <div className="text-gray-300 mb-1">
            <span className="font-medium">Status:</span> Not yet started
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold w-full"
              onClick={goToReviewVariant}
            >
              Start Review
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold w-full"
              onClick={goToTrainVariant}
            >
              Start Training
            </button>
          </div>
        </>
      );
    }

    if (isStudyPath(path)) {
      return (
        <>
          <AcademicCapIcon className="h-8 w-8 text-emerald-400 mb-2" />
          <div className="font-semibold text-lg text-emerald-300 mb-1">Study to Review</div>
          <div className="text-gray-100 mb-1">
            <span className="font-medium">Name:</span> {path.name}
          </div>
          <div className="text-gray-300 mb-1">
            <span className="font-medium">Last Session:</span> {path.lastSession}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold w-full sm:w-auto"
            onClick={goToStudy}
          >
            Go to Study
          </button>
        </>
      );
    }

    if (isEmptyPath(path)) {
      return (
        <>
          <div className="font-semibold text-lg text-gray-200 mb-2">All Caught Up!</div>
          <div className="text-gray-300 mb-2 text-center">You have no variants or studies to review right now.</div>
          <div className="text-gray-400 text-center">Adjust filters or return tomorrow for new due lessons.</div>
        </>
      );
    }

    return null;
  };

  const renderForecastDay = (day: PathForecastDay) => {
    const barWidth = day.dueCount === 0 ? 0 : (day.dueCount / maxForecastDayLoad) * 100;
    return (
      <div key={day.date} className="rounded-xl border border-gray-800 bg-gray-950/70 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-sm font-semibold text-gray-100">{day.date === plan?.todayKey ? "Today" : formatShortDate(day.date)}</div>
          <div className="text-xs text-gray-300">{day.dueCount} due</div>
        </div>
        <div className="h-2 rounded bg-gray-800 overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${barWidth}%` }} />
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {day.topOpenings.length === 0 && <span className="text-xs text-gray-500">No due openings</span>}
          {day.topOpenings.map((opening) => (
            <span key={`${day.date}-${opening.name}`} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700">
              {opening.name} ({opening.count})
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {day.variants.map((variant) => (
            <div key={`${day.date}-${variant.repertoireId}-${variant.variantName}`} className="text-xs text-gray-300 truncate">
              {variant.repertoireName}: {variant.variantName}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container p-0 sm:p-4 w-full h-full bg-gradient-to-b from-gray-900 via-primary to-gray-900 rounded-lg shadow-2xl flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col relative p-2 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto mt-1 sm:mt-2 flex flex-col gap-4 pb-4">
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/20 p-2">
                  <ArrowPathIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Path</h1>
                  <p className="text-xs sm:text-sm text-gray-400">Next lesson first. Forecast when you want the bigger plan.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-10 rounded-xl border border-gray-800 bg-gray-900/95 backdrop-blur p-2 sm:p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded px-3 py-2 text-sm font-semibold transition ${
                selectedView === "lesson" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedView("lesson")}
            >
              Next lesson
            </button>
            <button
              className={`rounded px-3 py-2 text-sm font-semibold transition ${
                selectedView === "forecast" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedView("forecast")}
            >
              Path forecast
            </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <select
                  id="category-select"
                  className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value as PathCategory | "all")}
                >
                  <option value="all">All Paths</option>
                  <option value="variantsWithErrors">Variants with Errors</option>
                  <option value="newVariants">New Variants</option>
                  <option value="oldVariants">Old Variants</option>
                  <option value="studyToReview">Studies to Review</option>
                </select>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-700 bg-gray-800 text-gray-100 text-sm hover:bg-gray-700"
                  onClick={() => setShowAdvancedFilters((previousValue) => !previousValue)}
                >
                  <FunnelIcon className="h-4 w-4" />
                  {showAdvancedFilters ? "Hide filters" : "Show filters"}
                </button>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded border border-gray-700 bg-gray-800 text-gray-200 text-sm hover:bg-gray-700"
                onClick={clearFilters}
              >
                Reset scope
              </button>
            </div>

            {activeFilterTags.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeFilterTags.map((tag) => (
                  <span key={tag} className="text-xs whitespace-nowrap px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-gray-800">
                <div className="flex flex-col">
                  <label htmlFor="orientation-filter" className="text-gray-300 mb-1 text-sm">
                    Color
                  </label>
                  <select
                    id="orientation-filter"
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                    value={filters.orientation}
                    onChange={(event) => setFilterField("orientation", event.target.value as FilterOrientation)}
                  >
                    <option value="all">All</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="opening-filter" className="text-gray-300 mb-1 text-sm">
                    Opening
                  </label>
                  <input
                    id="opening-filter"
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                    value={filters.openingName}
                    onChange={(event) => setFilterField("openingName", event.target.value)}
                    placeholder="e.g. Sicilian"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="fen-filter" className="text-gray-300 mb-1 text-sm">
                    FEN contains
                  </label>
                  <input
                    id="fen-filter"
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                    value={filters.fen}
                    onChange={(event) => setFilterField("fen", event.target.value)}
                    placeholder="piece placement..."
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date-from" className="text-gray-300 mb-1 text-sm">
                    Analytics from
                  </label>
                  <input
                    id="date-from"
                    type="date"
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                    value={filters.dateFrom}
                    onChange={(event) => setFilterField("dateFrom", event.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date-to" className="text-gray-300 mb-1 text-sm">
                    Analytics to
                  </label>
                  <input
                    id="date-to"
                    type="date"
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                    value={filters.dateTo}
                    onChange={(event) => setFilterField("dateTo", event.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="daily-new-limit" className="text-gray-300 mb-1 text-sm flex items-center gap-1">
                    <span>Daily new limit</span>
                    <MetricInfoTooltip text="Maximum number of brand-new variants to introduce per day. It does not affect due reviews." />
                  </label>
                  <input
                    id="daily-new-limit"
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                    value={filters.dailyNewLimit}
                    onChange={(event) => setFilterField("dailyNewLimit", event.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
            )}
          </div>

          {selectedView === "lesson" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-8 bg-gray-900 border border-gray-800 rounded-2xl shadow p-4 sm:p-6 w-full flex flex-col items-center justify-center min-h-[280px]">
                  {renderLessonCard()}
                </div>
                <div className="xl:col-span-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <MetricTitle
                        label="Overdue now"
                        helpText="Variants whose due date is already in the past and are still pending review."
                      />
                      <div className="text-xl font-semibold text-red-300">{plan?.overdueCount ?? 0}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <div className="text-xs text-gray-400">Due today</div>
                      <div className="text-xl font-semibold text-yellow-300">{plan?.dueTodayCount ?? 0}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <MetricTitle
                        label="Next 7 days"
                        helpText="Total due reviews scheduled in the first 7 days of the forecast window, including today."
                      />
                      <div className="text-xl font-semibold text-cyan-300">{nextSevenDueCount}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <MetricTitle
                        label="Suggested new"
                        helpText="Recommended new variants to add today after considering current due workload and New/Day cap."
                      />
                      <div className="text-xl font-semibold text-blue-300">{plan?.suggestedNewToday ?? 0}</div>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                    <div>
                      <div className="text-sm text-gray-200 font-semibold">Need a bigger-picture plan?</div>
                      <div className="text-sm text-gray-400">Open Path forecast to see likely openings and variants by day.</div>
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                      onClick={() => setSelectedView("forecast")}
                    >
                      Open forecast
                    </button>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
                    <div className="text-sm text-gray-200 font-semibold">Today vs plan</div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded bg-gray-800 px-2 py-2">
                        <div className="text-[11px] text-gray-400">Reviews (due)</div>
                        <div className="text-lg font-semibold text-cyan-300">{completedReviewsToday} / {reviewTargetToday}</div>
                      </div>
                      <div className="rounded bg-gray-800 px-2 py-2">
                        <div className="text-[11px] text-gray-400">New learned (first-time)</div>
                        <div className="text-lg font-semibold text-blue-300">{completedNewToday} / {newTargetToday}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-gray-800 px-2 py-2">
                        <div className="text-[11px] text-gray-400">Target</div>
                        <div className="text-lg font-semibold text-cyan-300">{plannedTodayTarget}</div>
                      </div>
                      <div className="rounded bg-gray-800 px-2 py-2">
                        <div className="text-[11px] text-gray-400">Completed</div>
                        <div className="text-lg font-semibold text-emerald-300">{completedToday}</div>
                      </div>
                      <div className="rounded bg-gray-800 px-2 py-2">
                        <div className="text-[11px] text-gray-400">Remaining</div>
                        <div className="text-lg font-semibold text-blue-300">{remainingToTarget}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Reviews remaining: {remainingReviewsTarget} · New remaining: {remainingNewTarget}
                    </div>
                    <div className="text-xs text-gray-500">
                      New learned increases only when a variant is reviewed for the first time in this filter scope.
                    </div>
                    <div className={`text-sm ${exceededTarget ? "text-emerald-300" : "text-gray-300"}`}>
                      {todayPlanMessage}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedView === "forecast" && (
            <div className="space-y-4">
              {(insightsLoading || loading) && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-blue-400 animate-pulse">
                  Loading path forecast...
                </div>
              )}

              {insightsError && (
                <div className="bg-gray-900 border border-red-900 rounded-xl p-4 text-red-400">{insightsError}</div>
              )}

              {!insightsLoading && plan && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <MetricTitle
                        label="Due now"
                        helpText="All variants currently due for review, including overdue and due-today items."
                      />
                      <div className="text-xl font-semibold text-red-300">{plan.reviewDueCount}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <MetricTitle
                        label="Next 7 days"
                        helpText="Total due reviews scheduled in the first 7 days of the forecast window, including today."
                      />
                      <div className="text-xl font-semibold text-cyan-300">{nextSevenDueCount}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <div className="text-xs text-gray-400">Variants in queue</div>
                      <div className="text-xl font-semibold text-gray-100">{nextVariants.length}</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <MetricTitle
                        label="Suggested new/day"
                        helpText="How many new variants are recommended today within the active New/Day cap."
                      />
                      <div className="text-xl font-semibold text-blue-300">{plan.suggestedNewToday}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-5 w-5 text-cyan-300" />
                        <h2 className="text-base font-semibold text-gray-100">Likely Study Path (14 days)</h2>
                        </div>
                        <div className="text-xs text-gray-400">Daily due load + representative variants</div>
                      </div>
                      {hasForecastLoad ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                          {forecastDays.map(renderForecastDay)}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-sm text-gray-400">
                          No due forecast inside the current filter scope.
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ListBulletIcon className="h-5 w-5 text-blue-300" />
                          <h2 className="text-base font-semibold text-gray-100">Likely Next Variants</h2>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {nextVariants.length === 0 && (
                            <div className="text-sm text-gray-500">No due variants in this filter scope.</div>
                          )}
                          {nextVariants.map((variant) => (
                            <div key={`${variant.repertoireId}-${variant.variantName}-${variant.dueDate}`} className="rounded border border-gray-800 bg-gray-900/60 p-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs text-gray-400">{variant.dueDate}</div>
                                {variant.orientation && (
                                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{variant.orientation}</div>
                                )}
                              </div>
                              <div className="text-sm text-gray-100 truncate">{variant.variantName}</div>
                              <div className="text-xs text-gray-400 truncate">{variant.repertoireName}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ChartBarIcon className="h-5 w-5 text-emerald-300" />
                          <h2 className="text-base font-semibold text-gray-100">Openings Entering Soon</h2>
                        </div>
                        {renderTopNamedCounts(upcomingOpenings, "No opening forecast in this scope.")}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!insightsLoading && analytics && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <div className="text-sm text-gray-300 mb-2">Recent review quality ({analytics.rangeStart} to {analytics.rangeEnd})</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ratingOrder.map((rating) => (
                      <div key={rating} className="rounded bg-gray-800 px-3 py-2 text-center">
                        <div className={`text-sm capitalize ${ratingColorClass[rating]}`}>{rating}</div>
                        <div className="text-lg text-gray-100 font-semibold">{analytics.ratingBreakdown[rating]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathPage;
