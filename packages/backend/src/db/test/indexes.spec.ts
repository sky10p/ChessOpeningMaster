import { ensureDatabaseIndexes } from "../indexes";

type MockCollection = {
  indexes: jest.Mock;
  dropIndex: jest.Mock;
  createIndex: jest.Mock;
  aggregate: jest.Mock;
  deleteMany: jest.Mock;
};

type MockDb = {
  collection: jest.Mock;
};

const createCollection = (): MockCollection => ({
  indexes: jest.fn().mockResolvedValue([]),
  dropIndex: jest.fn().mockResolvedValue(undefined),
  createIndex: jest.fn().mockResolvedValue("ok"),
  aggregate: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([]),
  }),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
});

describe("ensureDatabaseIndexes", () => {
  let positionsCollection: MockCollection;
  let usersCollection: MockCollection;
  let authTokensCollection: MockCollection;
  let repertoiresCollection: MockCollection;
  let studiesCollection: MockCollection;
  let variantsInfoCollection: MockCollection;
  let variantReviewHistoryCollection: MockCollection;
  let linkedGameAccountsCollection: MockCollection;
  let importedGamesCollection: MockCollection;
  let trainingPlansCollection: MockCollection;
  let mockDb: MockDb;

  beforeEach(() => {
    positionsCollection = createCollection();
    usersCollection = createCollection();
    authTokensCollection = createCollection();
    repertoiresCollection = createCollection();
    studiesCollection = createCollection();
    variantsInfoCollection = createCollection();
    variantReviewHistoryCollection = createCollection();
    linkedGameAccountsCollection = createCollection();
    importedGamesCollection = createCollection();
    trainingPlansCollection = createCollection();

    mockDb = {
      collection: jest.fn((name: string) => {
        if (name === "positions") return positionsCollection;
        if (name === "users") return usersCollection;
        if (name === "authTokens") return authTokensCollection;
        if (name === "repertoires") return repertoiresCollection;
        if (name === "studies") return studiesCollection;
        if (name === "variantsInfo") return variantsInfoCollection;
        if (name === "variantReviewHistory") return variantReviewHistoryCollection;
        if (name === "linkedGameAccounts") return linkedGameAccountsCollection;
        if (name === "importedGames") return importedGamesCollection;
        if (name === "trainingPlans") return trainingPlansCollection;
        throw new Error(`Unexpected collection ${name}`);
      }),
    };
  });

  it("drops legacy fen unique index when present", async () => {
    positionsCollection.indexes.mockResolvedValue([{ name: "fen_1", unique: true, key: { fen: 1 } }]);

    await ensureDatabaseIndexes(mockDb as never);

    expect(positionsCollection.dropIndex).toHaveBeenCalledWith("fen_1");
  });

  it("does not drop index when legacy fen unique index is absent", async () => {
    positionsCollection.indexes.mockResolvedValue([{ name: "fen_1_userId_1", unique: true, key: { fen: 1, userId: 1 } }]);

    await ensureDatabaseIndexes(mockDb as never);

    expect(positionsCollection.dropIndex).not.toHaveBeenCalled();
  });

  it("ignores recoverable index creation conflicts", async () => {
    usersCollection.createIndex.mockRejectedValue({ code: 85, codeName: "IndexOptionsConflict" });

    await expect(ensureDatabaseIndexes(mockDb as never)).resolves.toBeUndefined();
  });

  it("throws non-recoverable index creation errors", async () => {
    usersCollection.createIndex.mockRejectedValue(new Error("fatal"));

    await expect(ensureDatabaseIndexes(mockDb as never)).rejects.toThrow("fatal");
  });
});
