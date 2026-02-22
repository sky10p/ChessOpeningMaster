import { useChartColors } from "../../../../../hooks/useChartColors";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PathAnalyticsSummary,
  PathNamedCount,
  PathPlanSummary,
  ReviewRating,
} from "@chess-opening-master/common";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ArrowTopRightOnSquareIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { getTodayPlanProgress } from "../../../../../utils/path/todayPlanProgress";

interface SpacedRepetitionInsightsPanelProps {
  plan: PathPlanSummary | null;
  analytics: PathAnalyticsSummary | null;
  loading: boolean;
  error: string | null;
  dailyNewLimit?: number;
}

type RatingBarItem = {
  rating: ReviewRating;
  count: number;
};

type DueLoadItem = {
  date: string;
  dueCount: number;
};

type OpeningLoadItem = {
  opening: string;
  count: number;
};

const ratingColors: Record<ReviewRating, string> = {
  again: "#ef4444",
  hard: "#f59e0b",
  good: "#10b981",
  easy: "#3b82f6",
};

const ratingOrder: ReviewRating[] = ["again", "hard", "good", "easy"];

function mapUpcomingOpenings(entries: PathNamedCount[]): OpeningLoadItem[] {
  return entries
    .slice()
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)
    .map((entry) => ({
      opening: entry.name,
      count: entry.count,
    }));
}

interface MetricInfoTooltipProps {
  text: string;
}

const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({ text }) => {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label="Metric info"
        title="Metric info"
        className="text-text-subtle hover:text-text-muted focus:outline-none"
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-60 rounded-lg border border-border-default bg-surface px-3 py-2 text-xs text-text-muted shadow-xl group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
};

interface MetricCardProps {
  label: string;
  value: number;
  valueClassName: string;
  helpText: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  valueClassName,
  helpText,
}) => {
  return (
    <div className="bg-surface-raised rounded-lg p-3">
      <div className="text-xs text-text-subtle flex items-center gap-1">
        <span>{label}</span>
        <MetricInfoTooltip text={helpText} />
      </div>
      <div className={`text-xl font-semibold ${valueClassName}`}>{value}</div>
    </div>
  );
};

export const SpacedRepetitionInsightsPanel: React.FC<SpacedRepetitionInsightsPanelProps> = ({
  plan,
  analytics,
  loading,
  error,
  dailyNewLimit = 5,
}) => {
  const navigate = useNavigate();
  const { tickFill } = useChartColors();

  const dueLoadData = useMemo<DueLoadItem[]>(
    () =>
      (plan?.forecastDays || []).slice(0, 14).map((entry) => ({
        date: entry.date.slice(5),
        dueCount: entry.dueCount,
      })),
    [plan]
  );

  const ratingData = useMemo<RatingBarItem[]>(
    () =>
      ratingOrder.map((rating) => ({
        rating,
        count: analytics?.ratingBreakdown?.[rating] || 0,
      })),
    [analytics]
  );

  const openingsLoadData = useMemo<OpeningLoadItem[]>(
    () => mapUpcomingOpenings(plan?.upcomingOpenings || []),
    [plan]
  );
  const todayProgress = useMemo(() => getTodayPlanProgress(plan), [plan]);

  const nextVariants = (plan?.nextVariants || []).slice(0, 6);
  const dueThisWeek = dueLoadData.slice(0, 7).reduce((sum, entry) => sum + entry.dueCount, 0);
  const maxOpeningCount = openingsLoadData.reduce(
    (maxCount, entry) => Math.max(maxCount, entry.count),
    1
  );

  return (
    <section className="bg-surface rounded-xl p-4 shadow border border-border-subtle mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-base">Spaced Repetition Insights</h3>
          <p className="text-sm text-text-subtle">
            Due-load, rating quality, and opening forecast from your learning path.
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-border-default bg-surface-raised px-2 py-1 text-xs text-text-muted">
            <span>New/Day: {dailyNewLimit}</span>
            <MetricInfoTooltip text="Maximum number of new variants the planner can introduce per day within this view." />
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          onClick={() => navigate("/path")}
        >
          Open Path
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </button>
      </div>

      {loading && <div className="text-blue-400 animate-pulse">Loading spaced-repetition insights...</div>}
      {!loading && error && <div className="text-red-400">{error}</div>}

      {!loading && !error && plan && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Overdue"
              value={plan.overdueCount}
              valueClassName="text-red-300"
              helpText="Variants whose due date already passed and are still waiting for review."
            />
            <MetricCard
              label="Due today"
              value={plan.dueTodayCount}
              valueClassName="text-yellow-300"
              helpText="Variants scheduled exactly for today."
            />
            <MetricCard
              label="Due next 7d"
              value={dueThisWeek}
              valueClassName="text-cyan-300"
              helpText="Total reviews scheduled in the first 7 days of the forecast window, including today."
            />
            <MetricCard
              label="Suggested new"
              value={plan.suggestedNewToday}
              valueClassName="text-blue-300"
              helpText="Recommended new variants to add today after accounting for due workload and New/Day limit."
            />
          </div>

          <div className="bg-surface-raised rounded-lg p-3">
            <h4 className="text-sm font-semibold text-text-muted mb-2">Today vs Plan</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded bg-interactive/70 px-2 py-2">
                <div className="text-[11px] text-text-subtle">Reviews (due)</div>
                <div className="text-lg font-semibold text-cyan-300">
                  {todayProgress.completedReviewsToday} / {todayProgress.reviewTargetToday}
                </div>
              </div>
              <div className="rounded bg-interactive/70 px-2 py-2">
                <div className="text-[11px] text-text-subtle">New learned (first-time)</div>
                <div className="text-lg font-semibold text-blue-300">
                  {todayProgress.completedNewToday} / {todayProgress.newTargetToday}
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded bg-interactive/70 px-2 py-2">
                <div className="text-[11px] text-text-subtle">Target</div>
                <div className="text-lg font-semibold text-cyan-300">{todayProgress.plannedTodayTarget}</div>
              </div>
              <div className="rounded bg-interactive/70 px-2 py-2">
                <div className="text-[11px] text-text-subtle">Completed</div>
                <div className="text-lg font-semibold text-emerald-300">{todayProgress.completedToday}</div>
              </div>
              <div className="rounded bg-interactive/70 px-2 py-2">
                <div className="text-[11px] text-text-subtle">Remaining</div>
                <div className="text-lg font-semibold text-blue-300">{todayProgress.remainingToTarget}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-text-subtle">
              Reviews remaining: {todayProgress.remainingReviewsTarget} · New remaining: {todayProgress.remainingNewTarget}
            </div>
            <div className={`mt-1 text-sm ${todayProgress.exceededTarget ? "text-emerald-300" : "text-text-muted"}`}>
              {todayProgress.todayPlanMessage}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-surface-raised rounded-lg p-3">
              <h4 className="text-sm font-semibold text-text-muted mb-2">Upcoming Due Load (14 days)</h4>
              {dueLoadData.some((entry) => entry.dueCount > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dueLoadData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: tickFill, fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: tickFill, fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="dueCount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-text-subtle text-sm py-6">No due variants in the next 14 days for this filter.</div>
              )}
            </div>

            <div className="bg-surface-raised rounded-lg p-3">
              <h4 className="text-sm font-semibold text-text-muted mb-2">Likely Next Variants</h4>
              {nextVariants.length === 0 && (
                <div className="text-text-subtle text-sm">No variants due right now.</div>
              )}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {nextVariants.map((variant) => (
                  <div key={`${variant.repertoireId}-${variant.variantName}-${variant.dueDate}`} className="rounded border border-border-default px-2 py-2">
                    <div className="text-xs text-text-subtle">{variant.dueDate}</div>
                    <div className="text-sm text-text-base truncate">{variant.variantName}</div>
                    <div className="text-xs text-text-subtle truncate">{variant.repertoireName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-surface-raised rounded-lg p-3">
              <h4 className="text-sm font-semibold text-text-muted mb-2">Rating Distribution (30 days)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ratingData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" tick={{ fill: tickFill, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: tickFill, fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ratingData.map((entry) => (
                      <Cell key={entry.rating} fill={ratingColors[entry.rating]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface-raised rounded-lg p-3">
              <h4 className="text-sm font-semibold text-text-muted mb-2">Openings Entering the Queue</h4>
              {openingsLoadData.length === 0 ? (
                <div className="text-text-subtle text-sm py-6">No opening forecast available yet.</div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {openingsLoadData.map((entry) => {
                    const widthPercent = (entry.count / maxOpeningCount) * 100;
                    return (
                      <div key={entry.opening} className="rounded border border-border-default px-2 py-2">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                          <div className="text-sm text-text-base leading-snug break-words">{entry.opening}</div>
                          <div className="text-xs font-semibold text-emerald-300">{entry.count}</div>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded bg-interactive">
                          <div
                            className="h-full rounded bg-emerald-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
