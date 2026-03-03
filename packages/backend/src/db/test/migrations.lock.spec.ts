import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomUUID } from "crypto";
import { GLOBAL_MIGRATION_LOCK_ID, MIGRATION_LOCKS_COLLECTION } from "../migrations/constants";
import { acquireMigrationLock } from "../migrations/lock";

jest.setTimeout(60000);

const logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe("migration lock", () => {
  let server: MongoMemoryServer;
  let client: MongoClient;
  const createTestDb = () => client.db(`migration_lock_test_${randomUUID()}`);

  beforeEach(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
  });

  afterEach(async () => {
    await client.close();
    await server.stop();
    jest.clearAllMocks();
  });

  it("rejects a second owner while the lock lease is active", async () => {
    const db = createTestDb();
    const firstLock = await acquireMigrationLock(db, {
      logger,
      ownerId: "owner-1",
      leaseMs: 60000,
    });

    await expect(
      acquireMigrationLock(db, {
        logger,
        ownerId: "owner-2",
        leaseMs: 60000,
      })
    ).rejects.toThrow("Could not acquire the migration lock");

    await firstLock.release();
  });

  it("fails refresh when the lock is no longer owned by the current process", async () => {
    const db = createTestDb();
    const heldLock = await acquireMigrationLock(db, {
      logger,
      ownerId: "owner-1",
      leaseMs: 60000,
    });

    await db.collection<{ _id: string }>(MIGRATION_LOCKS_COLLECTION).deleteOne({ _id: GLOBAL_MIGRATION_LOCK_ID });

    await expect(heldLock.refresh()).rejects.toThrow(
      "Migration lock refresh failed because the active lease is no longer owned by this process."
    );
  });
});
