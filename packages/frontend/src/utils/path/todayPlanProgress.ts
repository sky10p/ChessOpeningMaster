import { PathPlanSummary } from "@chess-opening-master/common";

export interface TodayPlanProgress {
  reviewTargetToday: number;
  newTargetToday: number;
  plannedTodayTarget: number;
  completedReviewsToday: number;
  completedNewToday: number;
  completedToday: number;
  remainingToTarget: number;
  remainingReviewsTarget: number;
  remainingNewTarget: number;
  exceededTarget: boolean;
  todayPlanMessage: string;
}

export const getTodayPlanProgress = (plan: PathPlanSummary | null): TodayPlanProgress => {
  const reviewTargetToday = plan?.reviewDueCount ?? 0;
  const newTargetToday = plan?.suggestedNewToday ?? 0;
  const plannedTodayTarget = plan?.estimatedTodayTotal ?? reviewTargetToday + newTargetToday;
  const rawCompletedReviewsToday = plan?.completedDueToday ?? 0;
  const rawCompletedNewToday = plan?.completedNewToday ?? 0;
  const rawCompletedTotal = rawCompletedReviewsToday + rawCompletedNewToday;
  const fallbackCompletedTotal = plan?.completedTodayCount ?? rawCompletedTotal;

  const shouldUseProgressFallback =
    reviewTargetToday > 0 &&
    fallbackCompletedTotal > 0 &&
    rawCompletedReviewsToday === 0 &&
    rawCompletedNewToday >= fallbackCompletedTotal;

  const completedReviewsToday = shouldUseProgressFallback
    ? Math.min(fallbackCompletedTotal, reviewTargetToday)
    : rawCompletedReviewsToday;

  const completedNewToday = shouldUseProgressFallback
    ? Math.max(0, fallbackCompletedTotal - completedReviewsToday)
    : rawCompletedNewToday;

  const completedToday = completedReviewsToday + completedNewToday;
  const remainingToTarget = Math.max(0, plannedTodayTarget - completedToday);
  const remainingReviewsTarget = Math.max(0, reviewTargetToday - completedReviewsToday);
  const remainingNewTarget = Math.max(0, newTargetToday - completedNewToday);
  const exceededTarget = completedToday > plannedTodayTarget;

  const todayPlanMessage = getTodayPlanMessage({
    hasPlan: Boolean(plan),
    plannedTodayTarget,
    completedToday,
    exceededTarget,
    remainingToTarget,
  });

  return {
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
  };
};

interface TodayPlanMessageInput {
  hasPlan: boolean;
  plannedTodayTarget: number;
  completedToday: number;
  exceededTarget: boolean;
  remainingToTarget: number;
}

const getTodayPlanMessage = ({
  hasPlan,
  plannedTodayTarget,
  completedToday,
  exceededTarget,
  remainingToTarget,
}: TodayPlanMessageInput): string => {
  if (!hasPlan) {
    return "Loading today plan...";
  }
  if (plannedTodayTarget === 0 && completedToday === 0) {
    return "No scheduled items for today in this scope.";
  }
  if (plannedTodayTarget === 0 && completedToday > 0) {
    return "Great—save the rest for tomorrow.";
  }
  if (exceededTarget) {
    return "Great—save the rest for tomorrow.";
  }
  if (completedToday === plannedTodayTarget) {
    return "Great—you hit today’s target.";
  }
  return `${remainingToTarget} remaining to hit today’s target.`;
};