import * as mongo from "../../db/mongo";
import { getUtcDayKey } from "../spacedRepetitionService";
import { reviewVariantMistake } from "../variantMistakeService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

describe("variantMistakeService", () => {
  const fixedNow = new Date("2026-02-15T12:00:00.000Z");
  const mockVariantMistakesFindOne = jest.fn();
  const mockVariantMistakesUpdateOne = jest.fn();

  const mockDb = {
    collection: jest.fn((name: string) => {
      if (name === "variantMistakes") {
        return {
          findOne: mockVariantMistakesFindOne,
          updateOne: mockVariantMistakesUpdateOne,
        };
      }
      throw new Error(`Unknown collection: ${name}`);
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(fixedNow);
    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("schedules next mistake review on a future day", async () => {
    mockVariantMistakesFindOne
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId: "rep-1",
        mistakeKey: "Opening: A::4::e7e5::0",
        variantName: "Opening: A",
        openingName: "Opening",
        positionFen: "fen",
        variantStartFen: "start-fen",
        variantStartPly: 0,
        mistakePly: 4,
        expectedMoveLan: "e7e5",
        seenCount: 0,
        solvedCount: 0,
        intervalDays: 1,
        ease: 2.3,
        reps: 0,
        lapses: 0,
        dueAt: new Date("2026-02-15T00:00:00.000Z"),
        createdAt: new Date("2026-02-10T00:00:00.000Z"),
        updatedAt: new Date("2026-02-10T00:00:00.000Z"),
      })
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId: "rep-1",
        mistakeKey: "Opening: A::4::e7e5::0",
        variantName: "Opening: A",
        openingName: "Opening",
        positionFen: "fen",
        variantStartFen: "start-fen",
        variantStartPly: 0,
        mistakePly: 4,
        expectedMoveLan: "e7e5",
        seenCount: 1,
        solvedCount: 0,
        intervalDays: 1,
        ease: 2.1,
        reps: 0,
        lapses: 1,
        dueAt: new Date("2026-02-16T00:00:00.000Z"),
        lastReviewedAt: fixedNow,
        lastReviewedDayKey: "2026-02-15",
        state: "learning",
        lastRating: "again",
        createdAt: new Date("2026-02-10T00:00:00.000Z"),
        updatedAt: fixedNow,
      });
    mockVariantMistakesUpdateOne.mockResolvedValue({ acknowledged: true });

    const result = await reviewVariantMistake({
      userId: "user-1",
      repertoireId: "rep-1",
      mistakeKey: "Opening: A::4::e7e5::0",
      rating: "again",
    });

    expect(getUtcDayKey(result.dueAt)).not.toBe(getUtcDayKey(fixedNow));
    expect(result.lastReviewedDayKey).toBe("2026-02-15");
  });
});
