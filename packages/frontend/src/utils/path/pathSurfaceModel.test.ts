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
});
