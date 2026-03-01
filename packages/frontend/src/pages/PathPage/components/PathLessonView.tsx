import React from "react";
import {
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Path, PathPlanSummary } from "@chess-opening-master/common";
import { Button, EmptyState, MetricTitle } from "../../../components/ui";
import { isEmptyPath, isNewVariantPath, isStudiedVariantPath, isStudyPath } from "../helpers";

const formatDate = (date: string | Date): string => {
  const dateObject = typeof date === "string" ? new Date(date) : date;
  return dateObject.toLocaleDateString();
};

interface PathLessonViewProps {
  path: Path | null;
  loading: boolean;
  error: string | null;
  plan: PathPlanSummary | null;
  nextSevenDueCount: number;
  completedReviewsToday: number;
  reviewTargetToday: number;
  completedNewToday: number;
  newTargetToday: number;
  plannedTodayTarget: number;
  completedToday: number;
  remainingToTarget: number;
  remainingReviewsTarget: number;
  remainingNewTarget: number;
  exceededTarget: boolean;
  todayPlanMessage: string;
  onGoToReviewVariant: () => void;
  onGoToTrainVariant: () => void;
  onGoToStudy: () => void;
  onRemoveVariant: () => void;
  onSwitchToForecast: () => void;
}

export const PathLessonView: React.FC<PathLessonViewProps> = ({
  path,
  loading,
  error,
  plan,
  nextSevenDueCount,
  completedReviewsToday,
  reviewTargetToday,
  completedNewToday,
  newTargetToday,
  plannedTodayTarget,
  completedToday,
  remainingToTarget,
  remainingReviewsTarget,
  remainingNewTarget,
  exceededTarget,
  todayPlanMessage,
  onGoToReviewVariant,
  onGoToTrainVariant,
  onGoToStudy,
  onRemoveVariant,
  onSwitchToForecast,
}) => {
  const renderLessonCard = () => {
    if (loading) {
      return (
        <EmptyState
          variant="inline"
          title="Loading..."
          description="Loading your next lesson..."
          className="animate-pulse"
        />
      );
    }
    if (error) {
      return (
        <EmptyState
          variant="inline"
          title="Error"
          description={error}
          className="text-danger"
        />
      );
    }
    if (!path) {
      return (
        <EmptyState
          variant="inline"
          title="No Match"
          description="No lesson available matching your criteria."
        />
      );
    }

    if (isStudiedVariantPath(path)) {
      return (
        <>
          <BookOpenIcon className="h-8 w-8 text-brand mb-2" />
          <div className="font-semibold text-lg text-accent mb-1 text-center">
            Repertoire to review: {path.repertoireName}
          </div>
          <div className="text-text-base mb-1">
            <span className="font-medium">Name:</span> {path.name}
          </div>
          <div className="text-text-muted mb-1">
            <span className="font-medium">Errors:</span> {path.errors}
          </div>
          <div className="text-text-muted mb-1">
            <span className="font-medium">Last Reviewed:</span> {formatDate(path.lastDate)}
          </div>
          {path.dueAt && (
            <div className="text-text-muted mb-1">
              <span className="font-medium">Due At:</span> {formatDate(path.dueAt)}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <Button
              intent="primary"
              size="md"
              className="w-full justify-center"
              onClick={onGoToReviewVariant}
            >
              Start Review
            </Button>
            <Button
              intent="secondary"
              size="md"
              className="w-full justify-center"
              onClick={onGoToTrainVariant}
            >
              Start Training
            </Button>
          </div>
          <Button
            intent="danger"
            size="md"
            className="mt-4 w-full justify-center"
            onClick={onRemoveVariant}
          >
            <XMarkIcon className="h-5 w-5" />
            Remove this variant from path
          </Button>
        </>
      );
    }

    if (isNewVariantPath(path)) {
      return (
        <>
          <BookOpenIcon className="h-8 w-8 text-brand mb-2" />
          <div className="font-semibold text-lg text-accent mb-1 text-center">
            New Repertoire to learn: {path.repertoireName}
          </div>
          <div className="text-text-base mb-1">
            <span className="font-medium">Name:</span> {path.name}
          </div>
          <div className="text-text-muted mb-1">
            <span className="font-medium">Status:</span> Not yet started
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <Button
              intent="primary"
              size="md"
              className="w-full justify-center"
              onClick={onGoToReviewVariant}
            >
              Start Review
            </Button>
            <Button
              intent="secondary"
              size="md"
              className="w-full justify-center"
              onClick={onGoToTrainVariant}
            >
              Start Training
            </Button>
          </div>
        </>
      );
    }

    if (isStudyPath(path)) {
      return (
        <>
          <AcademicCapIcon className="h-8 w-8 text-success mb-2" />
          <div className="font-semibold text-lg text-success mb-1">Study to Review</div>
          <div className="text-text-base mb-1">
            <span className="font-medium">Name:</span> {path.name}
          </div>
          <div className="text-text-muted mb-1">
            <span className="font-medium">Last Session:</span> {path.lastSession}
          </div>
          <Button
            intent="accent"
            size="md"
            className="mt-4 w-full sm:w-auto justify-center"
            onClick={onGoToStudy}
          >
            Go to Study
          </Button>
        </>
      );
    }

    if (isEmptyPath(path)) {
      return (
        <EmptyState
          variant="inline"
          icon={CheckCircleIcon}
          title="All Caught Up!"
          description="You have no variants or studies to review right now. Adjust filters or return tomorrow for new due lessons."
        />
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-8 bg-surface border border-border-default rounded-2xl shadow p-4 sm:p-6 w-full flex flex-col items-center justify-center min-h-[280px]">
        {renderLessonCard()}
      </div>
      <div className="xl:col-span-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-border-default rounded-xl p-3">
            <MetricTitle
              label="Overdue now"
              helpText="Variants whose due date is already in the past and are still pending review."
            />
            <div className="text-xl font-semibold text-danger">{plan?.overdueCount ?? 0}</div>
          </div>
          <div className="bg-surface border border-border-default rounded-xl p-3">
            <div className="text-xs text-text-muted">Due today</div>
            <div className="text-xl font-semibold text-warning">{plan?.dueTodayCount ?? 0}</div>
          </div>
          <div className="bg-surface border border-border-default rounded-xl p-3">
            <MetricTitle
              label="Next 7 days"
              helpText="Total due reviews scheduled in the first 7 days of the forecast window, including today."
            />
            <div className="text-xl font-semibold text-brand">{nextSevenDueCount}</div>
          </div>
          <div className="bg-surface border border-border-default rounded-xl p-3">
            <MetricTitle
              label="Suggested new"
              helpText="Recommended new variants to add today after considering current due workload and New/Day cap."
            />
            <div className="text-xl font-semibold text-accent">{plan?.suggestedNewToday ?? 0}</div>
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-4 flex flex-col gap-3">
          <div>
            <div className="text-sm text-text-base font-semibold">Need a bigger-picture plan?</div>
            <div className="text-sm text-text-muted">Open Path forecast to see likely openings and variants by day.</div>
          </div>
          <Button
            type="button"
            intent="accent"
            size="sm"
            className="w-full justify-center"
            onClick={onSwitchToForecast}
          >
            Open forecast
          </Button>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-4 flex flex-col gap-2">
          <div className="text-sm text-text-base font-semibold">Today vs plan</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded bg-interactive px-2 py-2">
              <div className="text-[11px] text-text-muted">Reviews (due)</div>
              <div className="text-lg font-semibold text-brand">{completedReviewsToday} / {reviewTargetToday}</div>
            </div>
            <div className="rounded bg-interactive px-2 py-2">
              <div className="text-[11px] text-text-muted">New learned (first-time)</div>
              <div className="text-lg font-semibold text-accent">{completedNewToday} / {newTargetToday}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-interactive px-2 py-2">
              <div className="text-[11px] text-text-muted">Target</div>
              <div className="text-lg font-semibold text-brand">{plannedTodayTarget}</div>
            </div>
            <div className="rounded bg-interactive px-2 py-2">
              <div className="text-[11px] text-text-muted">Completed</div>
              <div className="text-lg font-semibold text-success">{completedToday}</div>
            </div>
            <div className="rounded bg-interactive px-2 py-2">
              <div className="text-[11px] text-text-muted">Remaining</div>
              <div className="text-lg font-semibold text-accent">{remainingToTarget}</div>
            </div>
          </div>
          <div className="text-xs text-text-muted">
            Reviews remaining: {remainingReviewsTarget} · New remaining: {remainingNewTarget}
          </div>
          <div className="text-xs text-text-subtle">
            New learned increases only when a variant is reviewed for the first time in this filter scope.
          </div>
          <div className={`text-sm ${exceededTarget ? "text-success" : "text-text-muted"}`}>
            {todayPlanMessage}
          </div>
        </div>
      </div>
    </div>
  );
};
