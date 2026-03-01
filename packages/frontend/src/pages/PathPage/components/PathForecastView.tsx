import React from "react";
import { MetricTitle } from "../../../components/ui";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import {
  PathForecastDay,
  PathNamedCount,
  PathPlanSummary,
  PathAnalyticsSummary,
  ReviewRating,
} from "@chess-opening-master/common";

const formatShortDate = (date: string): string => date.slice(5);

const ratingOrder: ReviewRating[] = ["again", "hard", "good", "easy"];
const ratingColorClass: Record<ReviewRating, string> = {
  again: "text-danger",
  hard: "text-warning",
  good: "text-brand",
  easy: "text-success",
};

interface PathForecastViewProps {
  plan: PathPlanSummary | null;
  analytics: PathAnalyticsSummary | null;
  insightsLoading: boolean;
  loading: boolean;
  insightsError: string | null;
  nextSevenDueCount: number;
}

export const PathForecastView: React.FC<PathForecastViewProps> = ({
  plan,
  analytics,
  insightsLoading,
  loading,
  insightsError,
  nextSevenDueCount,
}) => {
  const forecastDays = plan?.forecastDays || [];
  const nextVariants = plan?.nextVariants || [];
  const upcomingOpenings = plan?.upcomingOpenings || [];
  const maxForecastDayLoad = Math.max(...forecastDays.map((entry) => entry.dueCount), 1);
  const hasForecastLoad = forecastDays.some((entry) => entry.dueCount > 0);

  const renderTopNamedCounts = (entries: PathNamedCount[], emptyMessage: string) => {
    if (entries.length === 0) {
      return <div className="text-text-subtle text-sm">{emptyMessage}</div>;
    }
    return (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.name} className="flex justify-between text-sm">
            <span className="text-text-muted truncate pr-3">{entry.name}</span>
            <span className="text-accent font-semibold">{entry.count}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderForecastDay = (day: PathForecastDay) => {
    const barWidth = day.dueCount === 0 ? 0 : (day.dueCount / maxForecastDayLoad) * 100;
    return (
      <div key={day.date} className="rounded-xl border border-border-subtle bg-surface/70 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-sm font-semibold text-text-base">{day.date === plan?.todayKey ? "Today" : formatShortDate(day.date)}</div>
          <div className="text-xs text-text-muted">{day.dueCount} due</div>
        </div>
        <div className="h-2 rounded bg-surface-raised overflow-hidden mb-2">
          <div className="h-full bg-brand" style={{ width: `${barWidth}%` }} />
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {day.topOpenings.length === 0 && <span className="text-xs text-text-subtle">No due openings</span>}
          {day.topOpenings.map((opening) => (
            <span key={`${day.date}-${opening.name}`} className="text-xs px-2 py-1 rounded bg-surface-raised text-text-muted border border-border-default">
              {opening.name} ({opening.count})
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {day.variants.map((variant) => (
            <div key={`${day.date}-${variant.repertoireId}-${variant.variantName}`} className="text-xs text-text-muted truncate">
              {variant.repertoireName}: {variant.variantName}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {(insightsLoading || loading) && (
        <div className="bg-surface border border-border-subtle rounded-xl p-4 text-brand animate-pulse">
          Loading path forecast...
        </div>
      )}

      {insightsError && (
        <div className="bg-surface border border-danger rounded-xl p-4 text-danger">{insightsError}</div>
      )}

      {!insightsLoading && analytics && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-4">
          <div className="text-sm text-text-muted mb-2">Recent review quality ({analytics.rangeStart} to {analytics.rangeEnd})</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ratingOrder.map((rating) => (
              <div key={rating} className="rounded bg-surface-raised px-3 py-2 text-center">
                <div className={`text-sm capitalize ${ratingColorClass[rating]}`}>{rating}</div>
                <div className="text-lg text-text-base font-semibold">{analytics.ratingBreakdown[rating]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!insightsLoading && plan && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-surface border border-border-subtle rounded-xl p-3">
              <MetricTitle
                label="Due now"
                helpText="All variants currently due for review, including overdue and due-today items."
              />
              <div className="text-xl font-semibold text-danger">{plan.reviewDueCount}</div>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3">
              <MetricTitle
                label="Next 7 days"
                helpText="Total due reviews scheduled in the first 7 days of the forecast window, including today."
              />
              <div className="text-xl font-semibold text-brand">{nextSevenDueCount}</div>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3">
              <div className="text-xs text-text-subtle">Variants in queue</div>
              <div className="text-xl font-semibold text-text-base">{nextVariants.length}</div>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3">
              <MetricTitle
                label="Suggested new/day"
                helpText="How many new variants are recommended today within the active New/Day cap."
              />
              <div className="text-xl font-semibold text-accent">{plan.suggestedNewToday}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-surface border border-border-subtle rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-brand" />
                  <h2 className="text-base font-semibold text-text-base">Likely Study Path (14 days)</h2>
                </div>
                <div className="text-xs text-text-subtle">Daily due load + representative variants</div>
              </div>
              {hasForecastLoad ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                  {forecastDays.map(renderForecastDay)}
                </div>
              ) : (
                <div className="rounded-xl border border-border-subtle bg-surface/60 p-4 text-sm text-text-subtle">
                  No due forecast inside the current filter scope.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-surface border border-border-subtle rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListBulletIcon className="h-5 w-5 text-accent" />
                  <h2 className="text-base font-semibold text-text-base">Likely Next Variants</h2>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {nextVariants.length === 0 && (
                    <div className="text-sm text-text-subtle">No due variants in this filter scope.</div>
                  )}
                  {nextVariants.map((variant) => (
                    <div key={`${variant.repertoireId}-${variant.variantName}-${variant.dueDate}`} className="rounded border border-border-subtle bg-surface/60 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-text-subtle">{variant.dueDate}</div>
                        {variant.orientation && (
                          <div className="text-[10px] uppercase tracking-wide text-text-subtle">{variant.orientation}</div>
                        )}
                      </div>
                      <div className="text-sm text-text-base truncate">{variant.variantName}</div>
                      <div className="text-xs text-text-subtle truncate">{variant.repertoireName}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-border-subtle rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChartBarIcon className="h-5 w-5 text-success" />
                  <h2 className="text-base font-semibold text-text-base">Openings Entering Soon</h2>
                </div>
                {renderTopNamedCounts(upcomingOpenings, "No opening forecast in this scope.")}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
