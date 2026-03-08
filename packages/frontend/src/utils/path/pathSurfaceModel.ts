import { Path, PathPlanSummary } from "@chess-opening-master/common";
import { getTodayPlanProgress, TodayPlanProgress } from "./todayPlanProgress";

export type NextActionState =
  | "loading"
  | "forecast"
  | "study"
  | "variant"
  | "newVariant";

export interface NextActionModel {
  state: NextActionState;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryActionLabel?: string;
  secondaryActionKind?: "focusTrain";
}

export interface TodaySummaryModel extends TodayPlanProgress {
  overdueNow: number;
  dueToday: number;
  progressValue: string;
  progressDetail: string;
}

export interface PathSurfaceModel {
  nextAction: NextActionModel;
  todaySummary: TodaySummaryModel;
}

const getProgressValue = (todaySummary: TodayPlanProgress, plan: PathPlanSummary | null): string => {
  if (!plan) {
    return "Loading...";
  }
  if (todaySummary.plannedTodayTarget === 0) {
    if (todaySummary.completedToday === 0) {
      return "No items";
    }
    return `${todaySummary.completedToday} completed`;
  }
  return `${todaySummary.completedToday} / ${todaySummary.plannedTodayTarget}`;
};

const getNextActionModel = (path: Path | null, loading: boolean): NextActionModel => {
  if (loading) {
    return {
      state: "loading",
      title: "Loading next lesson",
      description: "Preparing your next best action.",
      primaryLabel: "Loading next lesson",
    };
  }

  if (!path || "message" in path) {
    return {
      state: "forecast",
      title: "Open forecast",
      description: "You are caught up for now. Use Path to plan the upcoming workload.",
      primaryLabel: "Open forecast",
    };
  }

  if (path.type === "study") {
    return {
      state: "study",
      title: "Open study",
      description: `${path.name} is next in your study review queue.`,
      primaryLabel: "Open study",
    };
  }

  if (path.type === "newVariant") {
    return {
      state: "newVariant",
      title: "Start new variant",
      description: `${path.repertoireName} - ${path.name}`,
      primaryLabel: "Start review",
      secondaryActionLabel: "Focus train",
      secondaryActionKind: "focusTrain",
    };
  }

  return {
    state: "variant",
    title: "Review due variant",
    description: `${path.repertoireName} - ${path.name}`,
    primaryLabel: "Start review",
    secondaryActionLabel: "Focus train",
    secondaryActionKind: "focusTrain",
  };
};

export const getPathSurfaceModel = (path: Path | null, plan: PathPlanSummary | null, loading: boolean): PathSurfaceModel => {
  const todaySummary = getTodayPlanProgress(plan);

  return {
    nextAction: getNextActionModel(path, loading),
    todaySummary: {
      ...todaySummary,
      overdueNow: plan?.overdueCount ?? 0,
      dueToday: plan?.dueTodayCount ?? 0,
      progressValue: getProgressValue(todaySummary, plan),
      progressDetail: todaySummary.todayPlanMessage,
    },
  };
};
