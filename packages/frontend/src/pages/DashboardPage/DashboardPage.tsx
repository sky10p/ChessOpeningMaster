import React from "react";
import { useNavigate } from "react-router-dom";
import { usePaths } from "../../hooks/usePaths";
import { PageHeader, SectionHeader, Card, Button, EmptyState } from "../../components/ui";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useNavigationUtils } from "../../utils/navigationUtils";
import { getPathSurfaceModel } from "../../utils/path/pathSurfaceModel";
import { isNewVariantPath, isStudyPath, isStudiedVariantPath } from "../PathPage/helpers";
import { StaticChessboard } from "../../components/design/chess/StaticChessboard";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { loadPath, loadInsights, path, plan, loading: pathLoading, error } = usePaths();
  const { goToRepertoire, goToTrainRepertoire } = useNavigationUtils();

  React.useEffect(() => {
    void loadPath();
    void loadInsights();
  }, [loadInsights, loadPath]);

  const surfaceModel = React.useMemo(
    () => getPathSurfaceModel(path, plan, pathLoading),
    [path, plan, pathLoading]
  );
  const boardPreview = React.useMemo(() => {
    if (!path || !(isStudiedVariantPath(path) || isNewVariantPath(path)) || !path.startingFen) {
      return null;
    }

    return {
      fen: path.startingFen,
      orientation: path.orientation,
    };
  }, [path]);

  const handlePrimaryAction = React.useCallback(() => {
    if (pathLoading) {
      return;
    }
    if (path && isStudyPath(path)) {
      navigate(`/studies?groupId=${encodeURIComponent(path.groupId)}&studyId=${encodeURIComponent(path.studyId)}`);
      return;
    }
    if (path && (isStudiedVariantPath(path) || isNewVariantPath(path))) {
      goToRepertoire(path.repertoireId, path.name, path.startingFen);
      return;
    }
    navigate("/path?view=forecast");
  }, [goToRepertoire, navigate, path, pathLoading]);

  const handleSecondaryHeroAction = React.useCallback(() => {
    if (
      pathLoading ||
      !path ||
      !(isStudiedVariantPath(path) || isNewVariantPath(path)) ||
      surfaceModel.nextAction.secondaryActionKind !== "focusTrain"
    ) {
      return;
    }
    goToTrainRepertoire(path.repertoireId, path.name);
  }, [goToTrainRepertoire, path, pathLoading, surfaceModel.nextAction.secondaryActionKind]);

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <PageHeader
            eyebrow={isMobile ? undefined : "Today"}
            title="Today"
            description={isMobile ? undefined : "Act on the next lesson first, then open Path when you need queue context."}
            secondaryActions={
              <Button intent="secondary" size="md" onClick={() => navigate("/path?view=forecast")}>
                Open Path
              </Button>
            }
            className={isMobile ? "gap-3 px-4 py-4" : undefined}
          />

          <div className="space-y-4">
            <Card padding="relaxed" className="space-y-5">
              <SectionHeader
                title="Next action"
                description={isMobile ? undefined : "Stay focused on the single next step that matters now."}
              />
              {pathLoading ? (
                <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 sm:p-6">
                  <div className="space-y-3">
                    <div className="h-3 w-32 animate-pulse rounded bg-interactive" />
                    <div className="h-8 w-52 animate-pulse rounded-lg bg-interactive" />
                    <div className="h-5 w-full animate-pulse rounded bg-interactive" />
                    <div className="h-12 w-40 animate-pulse rounded-xl bg-brand/20" />
                  </div>
                </div>
              ) : error ? (
                <EmptyState
                  title="Unable to load your next action"
                  description={error}
                  action={
                    <Button intent="secondary" size="sm" onClick={() => navigate("/path?view=forecast")}>
                      Open Path
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 sm:p-6">
                    <div className={boardPreview ? "grid gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-center" : undefined}>
                      {boardPreview ? (
                        <div className="overflow-hidden rounded-2xl border border-border-default bg-surface shadow-surface">
                          <StaticChessboard
                            fen={boardPreview.fen}
                            orientation={boardPreview.orientation}
                          />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                          Recommended next step
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-text-base">
                          {surfaceModel.nextAction.title}
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
                          {surfaceModel.nextAction.description}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button intent="primary" size="lg" onClick={handlePrimaryAction} disabled={pathLoading}>
                            {surfaceModel.nextAction.primaryLabel}
                          </Button>
                          {surfaceModel.nextAction.secondaryActionLabel ? (
                            <Button intent="secondary" size="lg" onClick={handleSecondaryHeroAction} disabled={pathLoading}>
                              {surfaceModel.nextAction.secondaryActionLabel}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                          Overdue now
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-danger">
                          {surfaceModel.todaySummary.overdueNow}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                          Due today
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-warning">
                          {surfaceModel.todaySummary.dueToday}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                          Today progress
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-brand">
                          {surfaceModel.todaySummary.progressValue}
                        </p>
                        <p className="mt-2 text-sm text-text-muted">
                          {surfaceModel.todaySummary.progressDetail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card padding="default" className="space-y-4">
              <SectionHeader
                title="Quick access"
                description="Jump into adjacent flows without turning Today into a second planning page."
              />
              <div className="grid gap-2 md:grid-cols-3">
                <Button intent="secondary" size="md" className="justify-between" onClick={() => navigate("/games")}>
                  Games intelligence
                </Button>
                <Button intent="secondary" size="md" className="justify-between" onClick={() => navigate("/studies")}>
                  Study library
                </Button>
                <Button
                  intent="secondary"
                  size="md"
                  className="justify-between"
                  onClick={() => navigate("/repertoires?status=errors")}
                >
                  Openings needing work
                </Button>
              </div>
            </Card>
          </div>
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};
