import { ObjectId } from "mongodb";
import * as mongo from "../../db/mongo";
import { getUserBackupFiles } from "../userBackupService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

type MockCursor = {
  sort: jest.Mock;
  toArray: jest.Mock;
};

type MockCollection = {
  find: jest.Mock;
};

const createCursor = (result: unknown[]): MockCursor => {
  const cursor: MockCursor = {
    sort: jest.fn(),
    toArray: jest.fn().mockResolvedValue(result),
  };
  cursor.sort.mockReturnValue(cursor);
  return cursor;
};

describe("userBackupService", () => {
  const userId = "507f1f77bcf86cd799439011";
  let collections: Record<string, MockCollection>;
  let cursors: Record<string, MockCursor>;
  let mockDb: { collection: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    cursors = {
      users: createCursor([
        {
          _id: new ObjectId(userId),
          username: "alice",
          passwordHash: "hash",
          passwordSalt: "salt",
        },
      ]),
      repertoires: createCursor([{ _id: "rep-1", userId }]),
      studies: createCursor([{ _id: "study-1", userId }]),
      variantsInfo: createCursor([{ _id: "variant-1", userId }]),
      positions: createCursor([{ _id: "position-1", userId }]),
      variantReviewHistory: createCursor([{ _id: "review-1", userId }]),
      variantMistakes: createCursor([{ _id: "mistake-1", userId }]),
      linkedGameAccounts: createCursor([{ _id: "account-1", userId, tokenEncrypted: "encrypted-token" }]),
      importedGames: createCursor([{ _id: "game-1", userId }]),
      trainingPlans: createCursor([{ _id: "plan-1", userId }]),
    };

    collections = Object.fromEntries(
      Object.entries(cursors).map(([name, cursor]) => [
        name,
        {
          find: jest.fn().mockReturnValue(cursor),
        },
      ])
    );

    mockDb = {
      collection: jest.fn((name: string) => {
        const collection = collections[name];
        if (!collection) {
          throw new Error(`Unexpected collection ${name}`);
        }
        return collection;
      }),
    };

    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);
  });

  it("builds a backup with the current user record and all user-scoped collections", async () => {
    const files = await getUserBackupFiles(userId);

    expect(files.map((file) => file.fileName)).toEqual([
      "users.json",
      "repertoires.json",
      "studies.json",
      "variantsInfo.json",
      "positions.json",
      "variantReviewHistory.json",
      "variantMistakes.json",
      "linkedGameAccounts.json",
      "importedGames.json",
      "trainingPlans.json",
    ]);
    expect(files.find((file) => file.fileName === "users.json")?.jsonValue).toEqual([
      {
        _id: new ObjectId(userId),
        username: "alice",
        passwordHash: "hash",
        passwordSalt: "salt",
      },
    ]);
  });

  it("queries only the current user and never reads authTokens", async () => {
    await getUserBackupFiles(userId);

    expect(collections.users.find).toHaveBeenCalledWith({ _id: new ObjectId(userId) });
    expect(cursors.users.sort).not.toHaveBeenCalled();
    expect(collections.repertoires.find).toHaveBeenCalledWith({ userId });
    expect(collections.studies.find).toHaveBeenCalledWith({ userId });
    expect(collections.variantsInfo.find).toHaveBeenCalledWith({ userId });
    expect(collections.positions.find).toHaveBeenCalledWith({ userId });
    expect(collections.variantReviewHistory.find).toHaveBeenCalledWith({ userId });
    expect(collections.variantMistakes.find).toHaveBeenCalledWith({ userId });
    expect(collections.linkedGameAccounts.find).toHaveBeenCalledWith({ userId });
    expect(collections.importedGames.find).toHaveBeenCalledWith({ userId });
    expect(collections.trainingPlans.find).toHaveBeenCalledWith({ userId });
    expect(mockDb.collection).not.toHaveBeenCalledWith("authTokens");
  });

  it("keeps encrypted provider tokens in linked account backups", async () => {
    const files = await getUserBackupFiles(userId);

    expect(files.find((file) => file.fileName === "linkedGameAccounts.json")?.jsonValue).toEqual([
      {
        _id: "account-1",
        userId,
        tokenEncrypted: "encrypted-token",
      },
    ]);
  });
});
