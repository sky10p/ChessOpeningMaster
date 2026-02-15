import { PathPlanSummary } from "@chess-opening-master/common";
import { getTodayPlanProgress } from "./todayPlanProgress";

const createPlan = (overrides: Partial<PathPlanSummary> = {}): PathPlanSummary => ({
  todayKey: "2026-02-15",
  overdueCount: 0,
  dueTodayCount: 0,
  reviewDueCount: 4,
  completedTodayCount: 3,
  completedDueToday: 2,
  completedNewToday: 1,
  newVariantsAvailable: 6,
  suggestedNewToday: 2,
  estimatedTodayTotal: 6,
  upcoming: [],
  forecastDays: [],
  nextVariants: [],
  upcomingOpenings: [],
  ...overrides,
});

describe("getTodayPlanProgress", () => {
  it("returns loading defaults when plan is null", () => {
    const result = getTodayPlanProgress(null);

    expect(result.reviewTargetToday).toBe(0);
    expect(result.newTargetToday).toBe(0);
    expect(result.completedToday).toBe(0);
    expect(result.todayPlanMessage).toBe("Loading today plan...");
  });

  it("uses direct completion fields when fallback conditions are not met", () => {
    const plan = createPlan({
      reviewDueCount: 5,
      suggestedNewToday: 3,
      estimatedTodayTotal: 8,
      completedDueToday: 2,
      completedNewToday: 1,
      completedTodayCount: 3,
    });

    const result = getTodayPlanProgress(plan);

    expect(result.completedReviewsToday).toBe(2);
    expect(result.completedNewToday).toBe(1);
    expect(result.remainingReviewsTarget).toBe(3);
    expect(result.remainingNewTarget).toBe(2);
    expect(result.remainingToTarget).toBe(5);
    expect(result.todayPlanMessage).toBe("5 remaining to hit today’s target.");
  });

  it("applies fallback split when only total completion is reliable", () => {
    const plan = createPlan({
      reviewDueCount: 3,
      suggestedNewToday: 2,
      estimatedTodayTotal: 5,
      completedDueToday: 0,
      completedNewToday: 5,
      completedTodayCount: 5,
    });

    const result = getTodayPlanProgress(plan);

    expect(result.completedReviewsToday).toBe(3);
    expect(result.completedNewToday).toBe(2);
    expect(result.remainingReviewsTarget).toBe(0);
    expect(result.remainingNewTarget).toBe(0);
    expect(result.remainingToTarget).toBe(0);
    expect(result.todayPlanMessage).toBe("Great—you hit today’s target.");
  });

  it("returns no-scheduled message when target and completion are both zero", () => {
    const plan = createPlan({
      reviewDueCount: 0,
      suggestedNewToday: 0,
      estimatedTodayTotal: 0,
      completedDueToday: 0,
      completedNewToday: 0,
      completedTodayCount: 0,
    });

    const result = getTodayPlanProgress(plan);

    expect(result.todayPlanMessage).toBe("No scheduled items for today in this scope.");
  });

  it("returns exceeded-target message when completed is above target", () => {
    const plan = createPlan({
      reviewDueCount: 2,
      suggestedNewToday: 1,
      estimatedTodayTotal: 3,
      completedDueToday: 3,
      completedNewToday: 1,
      completedTodayCount: 4,
    });

    const result = getTodayPlanProgress(plan);

    expect(result.exceededTarget).toBe(true);
    expect(result.todayPlanMessage).toBe("Great—save the rest for tomorrow.");
  });
});
