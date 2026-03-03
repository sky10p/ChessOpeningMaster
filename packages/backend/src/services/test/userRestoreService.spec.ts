import AdmZip from "adm-zip";
import { EJSON, ObjectId as BsonObjectId } from "bson";
import { ObjectId as MongoObjectId } from "mongodb";
import * as mongo from "../../db/mongo";
import { restoreUserBackup } from "../userRestoreService";

jest.mock("../../db/mongo", () => ({
  connectDB: jest.fn(),
  getDB: jest.fn(),
}));

type MockCollection = {
  replaceOne: jest.Mock;
  deleteMany: jest.Mock;
  insertMany: jest.Mock;
};

type MockSession = {
  withTransaction: jest.Mock;
  endSession: jest.Mock;
};

const createZipBuffer = (
  files: Record<string, unknown>,
  serializer: (value: unknown) => string = (value) => JSON.stringify(value, null, 2)
): Buffer => {
  const zip = new AdmZip();
  Object.entries(files).forEach(([fileName, value]) => {
    zip.addFile(fileName, Buffer.from(serializer(value)));
  });
  return zip.toBuffer();
};

describe("userRestoreService", () => {
  const userId = "507f1f77bcf86cd799439011";
  let collections: Record<string, MockCollection>;
  let mockDb: { collection: jest.Mock };
  let mockSession: MockSession;
  let mockClient: { startSession: jest.Mock };

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
    mockSession = {
      withTransaction: jest.fn(async (callback: () => Promise<void>) => {
        await callback();
      }),
      endSession: jest.fn().mockResolvedValue(undefined),
    };
    mockClient = {
      startSession: jest.fn(() => mockSession),
    };
    (mongo.connectDB as jest.Mock).mockResolvedValue(mockClient);
    (mongo.getDB as jest.Mock).mockReturnValue(mockDb);
  });

  it("replaces current user data from a valid backup zip inside a transaction", async () => {
    const zipBuffer = createZipBuffer({
      "users.json": [
        {
          _id: new BsonObjectId(userId),
          username: "alice",
          passwordHash: "hash",
          passwordSalt: "salt",
          createdAt: new Date("2026-03-03T00:00:00.000Z"),
        },
      ],
      "repertoires.json": [{ _id: new BsonObjectId("507f1f77bcf86cd799439012"), userId, name: "Rep" }],
      "studies.json": [],
      "variantsInfo.json": [
        {
          _id: new BsonObjectId("507f1f77bcf86cd799439014"),
          userId,
          repertoireId: "507f1f77bcf86cd799439012",
          variantName: "Main Line",
          errors: 0,
          lastDate: new Date("2026-03-02T00:00:00.000Z"),
          dueAt: new Date("2026-03-04T00:00:00.000Z"),
          lastReviewedAt: new Date("2026-03-03T00:00:00.000Z"),
          masteryUpdatedAt: new Date("2026-03-03T00:00:00.000Z"),
        },
      ],
      "positions.json": [],
      "variantReviewHistory.json": [
        {
          _id: new BsonObjectId("507f1f77bcf86cd799439015"),
          userId,
          repertoireId: "507f1f77bcf86cd799439012",
          variantName: "Main Line",
          reviewedAt: new Date("2026-03-03T00:00:00.000Z"),
          nextDueAt: new Date("2026-03-04T00:00:00.000Z"),
        },
      ],
      "variantMistakes.json": [
        {
          _id: new BsonObjectId("507f1f77bcf86cd799439016"),
          userId,
          repertoireId: "507f1f77bcf86cd799439012",
          variantName: "Main Line",
          openingName: "Italian Game",
          mistakeKey: "Main Line::1",
          positionFen: "fen",
          variantStartFen: "fen",
          variantStartPly: 0,
          mistakePly: 1,
          expectedMoveLan: "e2e4",
          seenCount: 1,
          solvedCount: 0,
          dueAt: new Date("2026-03-04T00:00:00.000Z"),
          lastReviewedAt: new Date("2026-03-03T00:00:00.000Z"),
          createdAt: new Date("2026-03-03T00:00:00.000Z"),
          updatedAt: new Date("2026-03-03T00:00:00.000Z"),
          archivedAt: new Date("2026-03-05T00:00:00.000Z"),
        },
      ],
      "linkedGameAccounts.json": [
        {
          _id: new BsonObjectId("507f1f77bcf86cd799439013"),
          userId,
          provider: "lichess",
          tokenEncrypted: "enc",
          connectedAt: new Date("2026-03-01T00:00:00.000Z"),
          lastSyncAt: new Date("2026-03-02T00:00:00.000Z"),
        },
      ],
      "importedGames.json": [
        {
          _id: new BsonObjectId("507f1f77bcf86cd799439017"),
          userId,
          source: "lichess",
          dedupeKey: "dedupe",
          white: "alice",
          black: "bob",
          result: "1-0",
          playedAt: new Date("2026-03-01T00:00:00.000Z"),
          pgn: "1. e4 e5",
          movesSan: ["e4", "e5"],
          openingDetection: { eco: "C50", name: "Italian Game" },
          openingMapping: { requiresManualReview: false },
          createdAt: new Date("2026-03-02T00:00:00.000Z"),
        },
      ],
      "trainingPlans.json": [
        {
          _id: new BsonObjectId("507f1f77bcf86cd799439018"),
          userId,
          id: "plan-1",
          generatedAt: "2026-03-02T00:00:00.000Z",
          generatedAtDate: new Date("2026-03-02T00:00:00.000Z"),
          weights: {
            frequency: 0.25,
            problem: 0.3,
            recency: 0.15,
            repertoireGap: 0.2,
            deviationRate: 0.1,
          },
          items: [],
        },
      ],
    }, (value) => EJSON.stringify(value, undefined, 2, { relaxed: false }));

    const result = await restoreUserBackup(userId, zipBuffer);

    expect(result).toEqual({
      userId,
      restoredCounts: {
        users: 1,
        repertoires: 1,
        studies: 0,
        variantsInfo: 1,
        positions: 0,
        variantReviewHistory: 1,
        variantMistakes: 1,
        linkedGameAccounts: 1,
        importedGames: 1,
        trainingPlans: 1,
      },
    });
    expect(mockClient.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.withTransaction).toHaveBeenCalledTimes(1);
    expect(collections.users.replaceOne).toHaveBeenCalledWith(
      { _id: new MongoObjectId(userId) },
      expect.objectContaining({
        _id: new MongoObjectId(userId),
        username: "alice",
        createdAt: new Date("2026-03-03T00:00:00.000Z"),
      }),
      { upsert: true, session: mockSession }
    );
    expect(collections.repertoires.deleteMany).toHaveBeenCalledWith(
      { userId },
      { session: mockSession }
    );
    expect(collections.repertoires.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: new MongoObjectId("507f1f77bcf86cd799439012"),
        userId,
      }),
    ], { session: mockSession });
    expect(collections.variantsInfo.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        lastDate: new Date("2026-03-02T00:00:00.000Z"),
        dueAt: new Date("2026-03-04T00:00:00.000Z"),
        lastReviewedAt: new Date("2026-03-03T00:00:00.000Z"),
        masteryUpdatedAt: new Date("2026-03-03T00:00:00.000Z"),
      }),
    ], { session: mockSession });
    expect(collections.linkedGameAccounts.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: new MongoObjectId("507f1f77bcf86cd799439013"),
        tokenEncrypted: "enc",
        connectedAt: new Date("2026-03-01T00:00:00.000Z"),
        lastSyncAt: new Date("2026-03-02T00:00:00.000Z"),
      }),
    ], { session: mockSession });
    expect(collections.importedGames.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        playedAt: new Date("2026-03-01T00:00:00.000Z"),
        createdAt: new Date("2026-03-02T00:00:00.000Z"),
      }),
    ], { session: mockSession });
    expect(collections.trainingPlans.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        generatedAtDate: new Date("2026-03-02T00:00:00.000Z"),
      }),
    ], { session: mockSession });
    expect(mockDb.collection).not.toHaveBeenCalledWith("authTokens");
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
  });

  it("rehydrates legacy ISO date strings from older JSON backups", async () => {
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
      "repertoires.json": [],
      "studies.json": [],
      "variantsInfo.json": [
        {
          _id: "507f1f77bcf86cd799439012",
          userId,
          repertoireId: "rep-1",
          variantName: "Main Line",
          errors: 0,
          lastDate: "2026-03-02T00:00:00.000Z",
          dueAt: "2026-03-04T00:00:00.000Z",
          lastReviewedAt: "2026-03-03T00:00:00.000Z",
        },
      ],
      "positions.json": [],
      "variantReviewHistory.json": [],
      "variantMistakes.json": [],
      "linkedGameAccounts.json": [],
      "importedGames.json": [],
      "trainingPlans.json": [],
    });

    await restoreUserBackup(userId, zipBuffer);

    expect(collections.users.replaceOne).toHaveBeenCalledWith(
      { _id: new MongoObjectId(userId) },
      expect.objectContaining({
        createdAt: new Date("2026-03-03T00:00:00.000Z"),
      }),
      { upsert: true, session: mockSession }
    );
    expect(collections.variantsInfo.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: new MongoObjectId("507f1f77bcf86cd799439012"),
        lastDate: new Date("2026-03-02T00:00:00.000Z"),
        dueAt: new Date("2026-03-04T00:00:00.000Z"),
        lastReviewedAt: new Date("2026-03-03T00:00:00.000Z"),
      }),
    ], { session: mockSession });
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

  it("surfaces a clear error when MongoDB transactions are unavailable", async () => {
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
    });
    mockSession.withTransaction.mockRejectedValue(
      new Error("Transaction numbers are only allowed on a replica set member or mongos")
    );

    await expect(restoreUserBackup(userId, zipBuffer)).rejects.toMatchObject({
      message: "Restore requires MongoDB transaction support (replica set or mongos)",
      status: 503,
    });
    expect(collections.users.replaceOne).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
  });
});
