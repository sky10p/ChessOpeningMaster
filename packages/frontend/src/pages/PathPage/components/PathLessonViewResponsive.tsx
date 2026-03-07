import React from "react";
import {
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Path } from "@chess-opening-master/common";
import { Button, EmptyState } from "../../../components/ui";
import { toUtcDateKey } from "../../../utils/dateUtils";
import { NextActionModel } from "../../../utils/path/pathSurfaceModel";
import { isEmptyPath, isNewVariantPath, isStudiedVariantPath, isStudyPath } from "../helpers";

const formatDate = (date: string | Date): string => {
  const dateObject = typeof date === "string" ? new Date(date) : date;
  return toUtcDateKey(dateObject);
};

interface PathLessonViewProps {
  path: Path | null;
  loading: boolean;
  error: string | null;
  nextAction: NextActionModel;
  onGoToReviewVariant: () => void;
  onGoToTrainVariant: () => void;
  onGoToStudy: () => void;
  onRemoveVariant: () => void;
}

export const PathLessonView: React.FC<PathLessonViewProps> = ({
  path,
  loading,
  error,
  nextAction,
  onGoToReviewVariant,
  onGoToTrainVariant,
  onGoToStudy,
  onRemoveVariant,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-surface sm:p-6">
        <EmptyState variant="inline" title={nextAction.title} description={nextAction.description} className="animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-surface sm:p-6">
        <EmptyState variant="inline" title="Unable to load next lesson" description={error} className="text-danger" />
      </div>
    );
  }

  if (!path || isEmptyPath(path)) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-surface sm:p-6">
        <EmptyState
          variant="inline"
          icon={CheckCircleIcon}
          title="Nothing due in this scope"
          description="You are caught up right now. Stay in forecast to inspect upcoming work or adjust the current scope."
        />
      </div>
    );
  }

  if (isStudiedVariantPath(path)) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-surface sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <BookOpenIcon className="h-8 w-8 text-brand" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Next lesson</p>
              <h2 className="text-2xl font-semibold leading-tight text-text-base">{nextAction.title}</h2>
              <p className="text-sm leading-6 text-text-muted">{nextAction.description}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Repertoire</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.repertoireName}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Variant</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.name}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Errors</p>
              <p className="mt-2 text-sm font-medium text-accent">{path.errors}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Due at</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.dueAt ? formatDate(path.dueAt) : "Ready now"}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button intent="primary" size="md" className="w-full justify-center" onClick={onGoToReviewVariant}>
              Start Review
            </Button>
            <Button intent="secondary" size="md" className="w-full justify-center" onClick={onGoToTrainVariant}>
              Start Training
            </Button>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-muted">
            Last reviewed: {formatDate(path.lastDate)}
          </div>

          <Button intent="danger" size="md" className="w-full justify-center" onClick={onRemoveVariant}>
            <XMarkIcon className="h-5 w-5" />
            Remove this variant from path
          </Button>
        </div>
      </div>
    );
  }

  if (isNewVariantPath(path)) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-surface sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <BookOpenIcon className="h-8 w-8 text-brand" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Next lesson</p>
              <h2 className="text-2xl font-semibold leading-tight text-text-base">{nextAction.title}</h2>
              <p className="text-sm leading-6 text-text-muted">{nextAction.description}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Repertoire</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.repertoireName}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Variant</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.name}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Status</p>
              <p className="mt-2 text-sm font-medium text-accent">Not started</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button intent="primary" size="md" className="w-full justify-center" onClick={onGoToReviewVariant}>
              Start Review
            </Button>
            <Button intent="secondary" size="md" className="w-full justify-center" onClick={onGoToTrainVariant}>
              Start Training
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isStudyPath(path)) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-surface sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <AcademicCapIcon className="h-8 w-8 text-success" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Next lesson</p>
              <h2 className="text-2xl font-semibold leading-tight text-text-base">{nextAction.title}</h2>
              <p className="text-sm leading-6 text-text-muted">{nextAction.description}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Study</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.name}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Last session</p>
              <p className="mt-2 text-sm font-medium text-text-base">{path.lastSession}</p>
            </div>
          </div>

          <Button intent="accent" size="md" className="w-full justify-center sm:w-auto" onClick={onGoToStudy}>
            Go to Study
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
