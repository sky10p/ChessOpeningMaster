import { ObjectId } from "mongodb";
import * as mongo from "../../db/mongo";
import { saveVariantReview } from "../variantReviewService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

describe("variantReviewService", () => {
  const fixedNow = new Date("2026-02-15T12:00:00.000Z");
  const mockRepertoiresFindOne = jest.fn();
  const mockVariantsInfoFindOne = jest.fn();
  const mockVariantsInfoUpdateOne = jest.fn();
  const mockVariantReviewHistoryInsertOne = jest.fn();
  const mockVariantMistakesUpdateOne = jest.fn();

  const mockDB = {
    collection: jest.fn((name: string) => {
      if (name === "repertoires") {
        return {
          findOne: mockRepertoiresFindOne,
        };
      }
      if (name === "variantsInfo") {
        return {
          findOne: mockVariantsInfoFindOne,
          updateOne: mockVariantsInfoUpdateOne,
        };
      }
      if (name === "variantReviewHistory") {
        return {
          insertOne: mockVariantReviewHistoryInsertOne,
        };
      }
      if (name === "variantMistakes") {
        return {
          updateOne: mockVariantMistakesUpdateOne,
        };
      }
      throw new Error(`Unknown collection: ${name}`);
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(fixedNow);
    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("rejects when repertoire does not exist for user", async () => {
    mockRepertoiresFindOne.mockResolvedValue(null);

    await expect(
      saveVariantReview({
        userId: "user-1",
        repertoireId: new ObjectId().toHexString(),
        variantName: "Opening: A",
        rating: "good",
      })
    ).rejects.toMatchObject({
      message: "Repertoire not found",
      status: 404,
    });

    expect(mockVariantsInfoUpdateOne).not.toHaveBeenCalled();
    expect(mockVariantReviewHistoryInsertOne).not.toHaveBeenCalled();
  });

  it("saves review when repertoire belongs to user", async () => {
    const repertoireId = new ObjectId().toHexString();
    mockRepertoiresFindOne.mockResolvedValue({ _id: new ObjectId(repertoireId), userId: "user-1" });
    mockVariantsInfoFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId,
        variantName: "Opening: A",
        errors: 1,
      });
    mockVariantsInfoUpdateOne.mockResolvedValue({ acknowledged: true });
    mockVariantReviewHistoryInsertOne.mockResolvedValue({ acknowledged: true });

    const result = await saveVariantReview({
      userId: "user-1",
      repertoireId,
      variantName: "Opening: A",
      rating: "good",
      wrongMoves: 1,
    });

    expect(mockRepertoiresFindOne).toHaveBeenCalledWith({
      _id: expect.any(ObjectId),
      userId: "user-1",
    });
    expect(mockVariantsInfoUpdateOne).toHaveBeenCalled();
    expect(mockVariantReviewHistoryInsertOne).toHaveBeenCalled();
    expect(result.variantInfo.repertoireId).toBe(repertoireId);
  });

  it("derives openingName from variantName instead of storing the full variant label", async () => {
    const repertoireId = new ObjectId().toHexString();
    mockRepertoiresFindOne.mockResolvedValue({ _id: new ObjectId(repertoireId), userId: "user-1" });
    mockVariantsInfoFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId,
        variantName: "Italian Game: Main Line",
        openingName: "Italian Game",
        errors: 0,
      });
    mockVariantsInfoUpdateOne.mockResolvedValue({ acknowledged: true });
    mockVariantReviewHistoryInsertOne.mockResolvedValue({ acknowledged: true });

    await saveVariantReview({
      userId: "user-1",
      repertoireId,
      variantName: "Italian Game: Main Line",
      rating: "good",
    });

    expect(mockVariantsInfoUpdateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          openingName: "Italian Game",
        }),
      }),
      { upsert: true }
    );
    expect(mockVariantReviewHistoryInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        openingName: "Italian Game",
      })
    );
  });

  it("keeps same-day daily errors monotonic when later run has fewer errors", async () => {
    const repertoireId = new ObjectId().toHexString();
    mockRepertoiresFindOne.mockResolvedValue({
      _id: new ObjectId(repertoireId),
      userId: "user-1",
    });
    mockVariantsInfoFindOne
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId,
        variantName: "Opening: A",
        errors: 4,
        dailyErrorsDayKey: "2026-02-15",
        dailyErrorCount: 4,
        dailyErrorSnapshot: [],
      })
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId,
        variantName: "Opening: A",
        errors: 4,
      });
    mockVariantsInfoUpdateOne.mockResolvedValue({ acknowledged: true });
    mockVariantReviewHistoryInsertOne.mockResolvedValue({ acknowledged: true });

    await saveVariantReview({
      userId: "user-1",
      repertoireId,
      variantName: "Opening: A",
      rating: "good",
      wrongMoves: 1,
    });

    expect(mockVariantsInfoUpdateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          errors: 4,
          dailyErrorCount: 4,
        }),
      }),
      { upsert: true }
    );
  });

  it("merges same-day new mistakes into daily snapshot and increases daily errors", async () => {
    const repertoireId = new ObjectId().toHexString();
    mockRepertoiresFindOne.mockResolvedValue({
      _id: new ObjectId(repertoireId),
      userId: "user-1",
    });
    mockVariantsInfoFindOne
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId,
        variantName: "Opening: A",
        errors: 1,
        dailyErrorsDayKey: "2026-02-15",
        dailyErrorCount: 1,
        dailyErrorSnapshot: [
          {
            mistakeKey: "Opening: A::4::e7e5::0",
            mistakePly: 4,
            variantStartPly: 0,
            positionFen: "fen-a",
            expectedMoveLan: "e7e5",
          },
        ],
      })
      .mockResolvedValueOnce({
        userId: "user-1",
        repertoireId,
        variantName: "Opening: A",
        errors: 2,
      });
    mockVariantsInfoUpdateOne.mockResolvedValue({ acknowledged: true });
    mockVariantReviewHistoryInsertOne.mockResolvedValue({ acknowledged: true });
    mockVariantMistakesUpdateOne.mockResolvedValue({ acknowledged: true });

    await saveVariantReview({
      userId: "user-1",
      repertoireId,
      variantName: "Opening: A",
      rating: "hard",
      wrongMoves: 1,
      startingFen: "start-fen",
      mistakes: [
        {
          mistakeKey: "Opening: A::6::b8c6::0",
          mistakePly: 6,
          variantStartPly: 0,
          positionFen: "fen-b",
          expectedMoveLan: "b8c6",
        },
      ],
    });

    expect(mockVariantsInfoUpdateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          errors: 2,
          dailyErrorCount: 2,
          dailyErrorSnapshot: expect.arrayContaining([
            expect.objectContaining({ mistakeKey: "Opening: A::4::e7e5::0" }),
            expect.objectContaining({ mistakeKey: "Opening: A::6::b8c6::0" }),
          ]),
        }),
      }),
      { upsert: true }
    );
    expect(mockVariantMistakesUpdateOne).toHaveBeenCalled();
  });
});
