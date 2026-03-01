import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../../components/ui";
import { ProgressStats } from "../types";
import {
  ExclamationTriangleIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

interface TodaysFocusCardProps {
  stats: ProgressStats;
  totalVariants: number;
}

type FocusPriority = {
  icon: React.ReactNode;
  headline: string;
  detail: string;
  cta: string;
  route: string;
  tone: "danger" | "warning" | "success" | "brand";
};

function determineFocus(stats: ProgressStats, totalVariants: number): FocusPriority {
  if (stats.reviewedWithErrors > 0) {
    return {
      icon: <ExclamationTriangleIcon className="h-6 w-6 text-danger" />,
      headline: `${stats.reviewedWithErrors} variant${stats.reviewedWithErrors === 1 ? "" : "s"} with errors`,
      detail: "Fix errors to strengthen your weakest lines first.",
      cta: "Train Errors",
      route: "/train",
      tone: "danger",
    };
  }

  if (stats.neverReviewed > 0) {
    return {
      icon: <EyeSlashIcon className="h-6 w-6 text-warning" />,
      headline: `${stats.neverReviewed} unreviewed variant${stats.neverReviewed === 1 ? "" : "s"}`,
      detail: "Review new lines to build your repertoire confidence.",
      cta: "Start Reviewing",
      route: "/path",
      tone: "warning",
    };
  }

  if (totalVariants > 0) {
    return {
      icon: <CheckCircleIcon className="h-6 w-6 text-success" />,
      headline: "All variants reviewed",
      detail: "Great job! Keep your edge sharp with regular practice.",
      cta: "Practice Now",
      route: "/train",
      tone: "success",
    };
  }

  return {
    icon: <FireIcon className="h-6 w-6 text-brand" />,
    headline: "Get started",
    detail: "Create a repertoire and start learning chess openings.",
    cta: "Create Repertoire",
    route: "/",
    tone: "brand",
  };
}

const toneClasses: Record<string, string> = {
  danger: "border-danger/30 bg-danger/5",
  warning: "border-warning/30 bg-warning/5",
  success: "border-success/30 bg-success/5",
  brand: "border-brand/30 bg-brand/5",
};

export const TodaysFocusCard: React.FC<TodaysFocusCardProps> = ({
  stats,
  totalVariants,
}) => {
  const navigate = useNavigate();
  const focus = determineFocus(stats, totalVariants);

  return (
    <div
      className={`mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${toneClasses[focus.tone]}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{focus.icon}</div>
        <div>
          <h3 className="text-base font-semibold text-text-base">
            {focus.headline}
          </h3>
          <p className="text-sm text-text-muted">{focus.detail}</p>
          {stats.reviewedToday > 0 && (
            <p className="mt-1 text-xs text-text-subtle">
              Today: {stats.reviewedTodayOk} OK · {stats.reviewedTodayErrors} errors
            </p>
          )}
        </div>
      </div>
      <Button
        intent="primary"
        size="sm"
        className="shrink-0 self-start sm:self-center"
        onClick={() => navigate(focus.route)}
      >
        {focus.cta}
      </Button>
    </div>
  );
};
