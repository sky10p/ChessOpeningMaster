import {
  computeNextSchedule,
  getUtcDayKey,
  inferSuggestedRatingFromLegacyErrors,
  inferSuggestedRatingFromMetrics,
  parseReviewRating,
} from "../spacedRepetitionService";

describe("spacedRepetitionService", () => {
  it("never schedules the next review on the same UTC day", () => {
    const now = new Date("2026-02-15T10:15:00.000Z");
    const schedule = computeNextSchedule(
      {
        intervalDays: 5,
        ease: 2.3,
        reps: 4,
        lapses: 0,
      },
      "hard",
      now
    );

    expect(getUtcDayKey(schedule.dueAt)).not.toBe(getUtcDayKey(now));
    expect(schedule.intervalDays).toBeGreaterThanOrEqual(1);
  });

  it("resets reps and increases lapses on again rating", () => {
    const schedule = computeNextSchedule(
      {
        intervalDays: 10,
        ease: 2.4,
        reps: 7,
        lapses: 2,
      },
      "again",
      new Date("2026-02-15T10:15:00.000Z")
    );

    expect(schedule.reps).toBe(0);
    expect(schedule.lapses).toBe(3);
    expect(schedule.intervalDays).toBe(1);
    expect(schedule.state).toBe("learning");
  });

  it("infers legacy ratings from error count", () => {
    expect(inferSuggestedRatingFromLegacyErrors(0)).toBe("good");
    expect(inferSuggestedRatingFromLegacyErrors(1)).toBe("hard");
    expect(inferSuggestedRatingFromLegacyErrors(4)).toBe("again");
  });

  it("infers suggested ratings from metrics", () => {
    expect(inferSuggestedRatingFromMetrics(3, 0, 120)).toBe("again");
    expect(inferSuggestedRatingFromMetrics(2, 0, 120)).toBe("hard");
    expect(inferSuggestedRatingFromMetrics(0, 0, 30)).toBe("easy");
    expect(inferSuggestedRatingFromMetrics(1, 0, 80)).toBe("good");
  });

  it("parses only supported ratings", () => {
    expect(parseReviewRating("again")).toBe("again");
    expect(parseReviewRating("hard")).toBe("hard");
    expect(parseReviewRating("good")).toBe("good");
    expect(parseReviewRating("easy")).toBe("easy");
    expect(parseReviewRating("invalid")).toBeNull();
  });
});
