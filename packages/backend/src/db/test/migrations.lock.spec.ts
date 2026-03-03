import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomUUID } from "crypto";
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
});
