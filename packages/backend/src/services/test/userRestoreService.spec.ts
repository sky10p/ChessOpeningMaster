import AdmZip from "adm-zip";
import { ObjectId } from "mongodb";
import * as mongo from "../../db/mongo";
import { restoreUserBackup } from "../userRestoreService";

jest.mock("../../db/mongo", () => ({
  getDB: jest.fn(),
}));

type MockCollection = {
  replaceOne: jest.Mock;
  deleteMany: jest.Mock;
  insertMany: jest.Mock;
};

const createZipBuffer = (files: Record<string, unknown>): Buffer => {
  const zip = new AdmZip();
  Object.entries(files).forEach(([fileName, value]) => {
    zip.addFile(fileName, Buffer.from(JSON.stringify(value, null, 2)));
  });
  return zip.toBuffer();
};

describe("userRestoreService", () => {
  const userId = "507f1f77bcf86cd799439011";
  let collections: Record<string, MockCollection>;
  let mockDb: { collection: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    collections = {
      users: {
        replaceOne: jest.fn().mockResolvedValue({ acknowledged: true }),
        deleteMany: jest.fn(),
        insertMany: jest.fn(),
      },
      repertoires: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      studies: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      variantsInfo: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      positions: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      variantReviewHistory: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      variantMistakes: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      linkedGameAccounts: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      importedGames: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
      trainingPlans: {
        replaceOne: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true }),
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true }),
      },
    };
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

  it("replaces current user data from a valid backup zip", async () => {
    const zipBuffer = createZipBuffer({
      "users.json": [
        {
          _id: userId,
          username: "alice",
          passwordHash: "hash",
          passwordSalt: "salt",
          createdAt: "2026-03-03T00:00:00.000Z",
        },
      ],
      "repertoires.json": [{ _id: "507f1f77bcf86cd799439012", userId, name: "Rep" }],
      "studies.json": [],
      "variantsInfo.json": [],
      "positions.json": [],
      "variantReviewHistory.json": [],
      "variantMistakes.json": [],
      "linkedGameAccounts.json": [{ _id: "507f1f77bcf86cd799439013", userId, tokenEncrypted: "enc" }],
      "importedGames.json": [],
      "trainingPlans.json": [],
    });

    const result = await restoreUserBackup(userId, zipBuffer);

    expect(result).toEqual({
      userId,
      restoredCounts: {
        users: 1,
        repertoires: 1,
        studies: 0,
        variantsInfo: 0,
        positions: 0,
        variantReviewHistory: 0,
        variantMistakes: 0,
        linkedGameAccounts: 1,
        importedGames: 0,
        trainingPlans: 0,
      },
    });
    expect(collections.users.replaceOne).toHaveBeenCalledWith(
      { _id: new ObjectId(userId) },
      expect.objectContaining({
        _id: new ObjectId(userId),
        username: "alice",
      }),
      { upsert: true }
    );
    expect(collections.repertoires.deleteMany).toHaveBeenCalledWith({ userId });
    expect(collections.repertoires.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: new ObjectId("507f1f77bcf86cd799439012"),
        userId,
      }),
    ]);
    expect(collections.linkedGameAccounts.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: new ObjectId("507f1f77bcf86cd799439013"),
        tokenEncrypted: "enc",
      }),
    ]);
    expect(mockDb.collection).not.toHaveBeenCalledWith("authTokens");
  });

  it("rejects backups for a different user", async () => {
    const zipBuffer = createZipBuffer({
      "users.json": [
        {
          _id: "507f1f77bcf86cd799439099",
          username: "alice",
          passwordHash: "hash",
          passwordSalt: "salt",
        },
      ],
      "repertoires.json": [],
      "studies.json": [],
      "variantsInfo.json": [],
      "positions.json": [],
      "variantReviewHistory.json": [],
      "variantMistakes.json": [],
      "linkedGameAccounts.json": [],
      "importedGames.json": [],
      "trainingPlans.json": [],
    });

    await expect(restoreUserBackup(userId, zipBuffer)).rejects.toMatchObject({
      message: "Backup user does not match the current authenticated user",
      status: 400,
    });
    expect(collections.users.replaceOne).not.toHaveBeenCalled();
  });

  it("rejects backups with user-scoped data for another user", async () => {
    const zipBuffer = createZipBuffer({
      "users.json": [
        {
          _id: userId,
          username: "alice",
          passwordHash: "hash",
          passwordSalt: "salt",
        },
      ],
      "repertoires.json": [{ _id: "507f1f77bcf86cd799439012", userId: "other-user" }],
      "studies.json": [],
      "variantsInfo.json": [],
      "positions.json": [],
      "variantReviewHistory.json": [],
      "variantMistakes.json": [],
      "linkedGameAccounts.json": [],
      "importedGames.json": [],
      "trainingPlans.json": [],
    });

    await expect(restoreUserBackup(userId, zipBuffer)).rejects.toMatchObject({
      message: 'Backup file "repertoires.json" contains data for a different user',
      status: 400,
    });
    expect(collections.repertoires.deleteMany).not.toHaveBeenCalled();
  });

  it("rejects backups with unsupported files", async () => {
    const zipBuffer = createZipBuffer({
      "users.json": [
        {
          _id: userId,
          username: "alice",
          passwordHash: "hash",
          passwordSalt: "salt",
        },
      ],
      "repertoires.json": [],
      "studies.json": [],
      "variantsInfo.json": [],
      "positions.json": [],
      "variantReviewHistory.json": [],
      "variantMistakes.json": [],
      "linkedGameAccounts.json": [],
      "importedGames.json": [],
      "trainingPlans.json": [],
      "authTokens.json": [],
    });

    await expect(restoreUserBackup(userId, zipBuffer)).rejects.toMatchObject({
      message: "Backup contains unsupported files: authTokens.json",
      status: 400,
    });
  });
});
