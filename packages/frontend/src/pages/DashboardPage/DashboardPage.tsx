import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import { usePaths } from "../../hooks/usePaths";
import { PageHeader, StatStrip, SectionHeader, Card, Button, EmptyState, Badge } from "../../components/ui";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { useDashboardData } from "./sections/DashboardSection/hooks/useDashboardData";
import { getTodayPlanProgress } from "../../utils/path/todayPlanProgress";
import { isEmptyPath, isNewVariantPath, isStudyPath, isStudiedVariantPath } from "../PathPage/helpers";
import { useIsMobile } from "../../hooks/useIsMobile";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { repertoires, loading } = useDashboard();
  const { loadPath, loadInsights, path, plan, loading: pathLoading, error } = usePaths();
  const { totalRepertoires, totalVariants, progressStats } = useDashboardData(repertoires, "all");

  React.useEffect(() => {
    void loadPath();
    void loadInsights();
  }, [loadInsights, loadPath]);

  const todayPlan = React.useMemo(() => getTodayPlanProgress(plan), [plan]);
  const nextActionLabel = React.useMemo(() => {
    if (pathLoading) {
      return "Loading next lesson";
    }
    if (!path || isEmptyPath(path)) {
      return "Open forecast";
    }
    if (isStudyPath(path)) {
      return "Open study";
    }
    if (isStudiedVariantPath(path)) {
      return "Review due variant";
    }
    if (isNewVariantPath(path)) {
      return "Start new variant";
    }
    return "Open queue";
  }, [path, pathLoading]);

  const nextActionDescription = React.useMemo(() => {
    if (pathLoading) {
      return "Preparing your next best action.";
    }
    if (!path || isEmptyPath(path)) {
      return "You are caught up for now. Use the forecast to plan upcoming work.";
    }
    if (isStudyPath(path)) {
      return `${path.name} is next in your study review queue.`;
    }
    if (isStudiedVariantPath(path) || isNewVariantPath(path)) {
      return `${path.repertoireName} • ${path.name}`;
    }
    return "Open your queue to continue.";
  }, [path, pathLoading]);

  const handlePrimaryAction = React.useCallback(() => {
    if (path && isStudyPath(path)) {
      navigate(`/studies?groupId=${encodeURIComponent(path.groupId)}&studyId=${encodeURIComponent(path.studyId)}`);
      return;
    }
    navigate("/path");
  }, [navigate, path]);

  const thisWeekCard = (
    <Card padding="relaxed" className="space-y-4">
      <SectionHeader title="This week" description="Keep the workload visible before it becomes a surprise." />
      <div className="space-y-3">
        <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Due today</p>
          <p className="mt-2 text-2xl font-semibold text-warning">{plan?.dueTodayCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Overdue now</p>
          <p className="mt-2 text-2xl font-semibold text-danger">{plan?.overdueCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Next 7 days</p>
          <p className="mt-2 text-2xl font-semibold text-brand">
            {(plan?.forecastDays || []).slice(0, 7).reduce((sum, day) => sum + day.dueCount, 0)}
          </p>
        </div>
      </div>
    </Card>
  );

  const quickAccessCard = (
    <Card padding="relaxed" className="space-y-4">
      <SectionHeader title="Quick access" description="Jump into the adjacent flows without losing context." />
      <div className="grid gap-2">
        <Button intent="secondary" size="md" className="justify-between" onClick={() => navigate("/games")}>
          Games intelligence
        </Button>
        <Button intent="secondary" size="md" className="justify-between" onClick={() => navigate("/studies")}>
          Study library
        </Button>
        <Button intent="secondary" size="md" className="justify-between" onClick={() => navigate("/repertoires?status=errors")}>
          Openings needing work
        </Button>
      </div>
    </Card>
  );

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <PageHeader
            eyebrow={isMobile ? undefined : "Today"}
            title="Today"
            description={
              isMobile
                ? undefined
                : "Start with the next lesson, stay on top of due work, and keep the rest of the week visible without scanning multiple pages."
            }
            primaryAction={!isMobile ? (
              <Button intent="primary" size="md" onClick={handlePrimaryAction}>
                {nextActionLabel}
              </Button>
            ) : undefined}
            secondaryActions={!isMobile ? (
              <Button intent="secondary" size="md" onClick={() => navigate("/repertoires")}>
                Open library
              </Button>
            ) : undefined}
            meta={!isMobile ? (
              <>
                <Badge variant="brand" size="sm">
                  {totalRepertoires} repertoires
                </Badge>
                <Badge variant="warning" size="sm">
                  {plan?.dueTodayCount ?? 0} due today
                </Badge>
                <Badge variant="danger" size="sm">
                  {plan?.overdueCount ?? 0} overdue
                </Badge>
              </>
            ) : undefined}
            className={isMobile ? "gap-3 px-4 py-4" : undefined}
          />

          {!isMobile ? (
            <StatStrip
            items={[
              {
                label: "Variants tracked",
                value: totalVariants,
                tone: "brand",
                detail: `${progressStats.neverReviewed} never reviewed`,
              },
              {
                label: "Reviewed with errors",
                value: progressStats.reviewedWithErrors,
                tone: "danger",
                detail: `${progressStats.reviewedTodayErrors} touched today`,
              },
              {
                label: "Reviewed cleanly",
                value: progressStats.reviewedOK,
                tone: "success",
                detail: `${progressStats.reviewedTodayOk} completed today`,
              },
              {
                label: "Daily target",
                value: todayPlan.plannedTodayTarget,
                tone: "accent",
                detail: `${todayPlan.completedToday} done • ${todayPlan.remainingToTarget} remaining`,
              },
            ]}
            />
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
            <Card padding="relaxed" className="space-y-5">
              <SectionHeader
                title="Next lesson"
                description={isMobile ? undefined : "The queue always prioritizes the most important next step."}
                action={!isMobile ? (
                  <Button intent="secondary" size="sm" onClick={() => navigate("/path")}>
                    Open queue
                  </Button>
                ) : undefined}
              />
              {pathLoading ? (
                <div className="space-y-3">
                  <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-raised" />
                  <div className="h-4 w-72 animate-pulse rounded bg-surface-raised" />
                  <div className="h-32 animate-pulse rounded-2xl bg-surface-raised" />
                </div>
              ) : error ? (
                <EmptyState
                  title="Unable to load your queue"
                  description={error}
                  action={
                    <Button intent="secondary" size="sm" onClick={() => navigate("/path")}>
                      Open queue
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                      Recommended next action
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight text-text-base">
                      {nextActionLabel}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{nextActionDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button intent="primary" size="md" onClick={handlePrimaryAction}>
                        {nextActionLabel}
                      </Button>
                      <Button intent="secondary" size="md" onClick={() => navigate("/path?view=forecast")}>
                        View forecast
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Reviews today</p>
                      <p className="mt-2 text-2xl font-semibold text-brand">
                        {todayPlan.completedReviewsToday} / {todayPlan.reviewTargetToday}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">New learned</p>
                      <p className="mt-2 text-2xl font-semibold text-accent">
                        {todayPlan.completedNewToday} / {todayPlan.newTargetToday}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Plan message</p>
                      <p className="mt-2 text-sm leading-6 text-text-muted">{todayPlan.todayPlanMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              {isMobile ? quickAccessCard : thisWeekCard}
              {isMobile ? thisWeekCard : quickAccessCard}
            </div>
          </div>
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};
