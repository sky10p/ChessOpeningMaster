import { getPathSurfaceModel } from "./pathSurfaceModel";

const basePlan = {
  todayKey: "2026-03-07",
  overdueCount: 2,
  dueTodayCount: 3,
  reviewDueCount: 3,
  completedTodayCount: 1,
  completedDueToday: 1,
  completedNewToday: 0,
  newVariantsAvailable: 2,
  suggestedNewToday: 1,
  estimatedTodayTotal: 4,
  upcoming: [],
  forecastDays: [],
  nextVariants: [],
  upcomingOpenings: [],
};

describe("getPathSurfaceModel", () => {
  it("adds a focus-train secondary action for studied variants", () => {
    const result = getPathSurfaceModel(
      {
        type: "variant",
        id: "variant-1",
        repertoireId: "rep-1",
        repertoireName: "Main Repertoire",
        name: "French Defense",
        errors: 2,
        lastDate: new Date("2026-03-06"),
      },
      basePlan,
      false
    );

    expect(result.nextAction.primaryLabel).toBe("Start review");
    expect(result.nextAction.secondaryActionLabel).toBe("Focus train");
    expect(result.nextAction.secondaryActionKind).toBe("focusTrain");
  });

  it("adds a focus-train secondary action for new variants", () => {
    const result = getPathSurfaceModel(
      {
        type: "newVariant",
        repertoireId: "rep-1",
        repertoireName: "Main Repertoire",
        name: "Italian Game",
      },
      basePlan,
      false
    );

    expect(result.nextAction.primaryLabel).toBe("Start review");
    expect(result.nextAction.secondaryActionLabel).toBe("Focus train");
    expect(result.nextAction.secondaryActionKind).toBe("focusTrain");
  });

  it("does not add a focus-train action for studies", () => {
    const result = getPathSurfaceModel(
      {
        type: "study",
        groupId: "group-1",
        studyId: "study-1",
        name: "Endgame Study",
        lastSession: "2026-03-06",
      },
      basePlan,
      false
    );

    expect(result.nextAction.primaryLabel).toBe("Open study");
    expect(result.nextAction.secondaryActionLabel).toBeUndefined();
    expect(result.nextAction.secondaryActionKind).toBeUndefined();
  });

  it("does not add a focus-train action for empty or loading states", () => {
    const emptyResult = getPathSurfaceModel({ message: "All caught up" }, basePlan, false);
    const loadingResult = getPathSurfaceModel(null, basePlan, true);

    expect(emptyResult.nextAction.secondaryActionLabel).toBeUndefined();
    expect(emptyResult.nextAction.secondaryActionKind).toBeUndefined();
    expect(loadingResult.nextAction.secondaryActionLabel).toBeUndefined();
    expect(loadingResult.nextAction.secondaryActionKind).toBeUndefined();
  });

  it("uses the today plan message when the daily target is fully completed", () => {
    const result = getPathSurfaceModel(
      { message: "All caught up" },
      {
        ...basePlan,
        completedTodayCount: 4,
        completedDueToday: 3,
        completedNewToday: 1,
        estimatedTodayTotal: 4,
      },
      false
    );

    expect(result.todaySummary.progressValue).toBe("4 / 4");
    expect(result.todaySummary.progressDetail).toBe("Great—you hit today’s target.");
  });

  it("shows loading copy instead of 0 / 0 while the plan is missing", () => {
    const result = getPathSurfaceModel({ message: "All caught up" }, null, false);

    expect(result.todaySummary.progressValue).toBe("Loading...");
    expect(result.todaySummary.progressDetail).toBe("Loading today plan...");
  });

  it("shows a no-scheduled state instead of 0 / 0 when nothing is planned", () => {
    const result = getPathSurfaceModel(
      { message: "All caught up" },
      {
        ...basePlan,
        reviewDueCount: 0,
        suggestedNewToday: 0,
        estimatedTodayTotal: 0,
        completedTodayCount: 0,
        completedDueToday: 0,
        completedNewToday: 0,
      },
      false
    );

    expect(result.todaySummary.progressValue).toBe("No items");
    expect(result.todaySummary.progressDetail).toBe("No scheduled items for today in this scope.");
  });
});
