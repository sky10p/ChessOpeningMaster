import { ObjectId } from "mongodb";
import * as mongo from "../../db/mongo";
import { saveVariantReview } from "../variantReviewService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

describe("variantReviewService", () => {
  const mockRepertoiresFindOne = jest.fn();
  const mockVariantsInfoFindOne = jest.fn();
  const mockVariantsInfoUpdateOne = jest.fn();
  const mockVariantReviewHistoryInsertOne = jest.fn();

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
      throw new Error(`Unknown collection: ${name}`);
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
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
});
