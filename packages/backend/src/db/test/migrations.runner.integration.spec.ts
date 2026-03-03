import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createHash, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { MIGRATIONS_COLLECTION } from "../migrations/constants";
import { applyMigrations, getMigrationStatus } from "../migrations/runner";

jest.setTimeout(60000);

const INITIAL_SCHEMA_MIGRATION_ID = "20260303120000_initial_schema";
const INITIAL_SCHEMA_MIGRATION_NAME = "initial schema";
const INITIAL_SCHEMA_MIGRATION_CHECKSUM = createHash("sha256")
  .update(
    fs.readFileSync(
      path.resolve(__dirname, "../migrations/definitions/20260303120000_initial_schema.ts"),
      "utf8"
    )
  )
  .digest("hex");

describe("migration runner", () => {
  let server: MongoMemoryServer;
  let client: MongoClient;
  const createTestDb = () => client.db(`migration_runner_test_${randomUUID()}`);

  beforeEach(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
  });

  afterEach(async () => {
    await client.close();
    await server.stop();
  });

  it("applies the baseline schema on a fresh database", async () => {
    const db = createTestDb();

    const result = await applyMigrations({
      db,
      appVersion: "test",
    });

    expect(result.appliedMigrationIds).toEqual([INITIAL_SCHEMA_MIGRATION_ID]);

    const appliedMigrations = await db.collection<{ _id: string }>(MIGRATIONS_COLLECTION).find().toArray();
    expect(appliedMigrations.map((migration) => migration._id)).toEqual([INITIAL_SCHEMA_MIGRATION_ID]);

    const positionIndexes = await db.collection("positions").listIndexes().toArray();
    expect(
      positionIndexes.some(
        (index) =>
          index.name === "fen_1_userId_1" &&
          index.unique === true &&
          index.key?.fen === 1 &&
          index.key?.userId === 1
      )
    ).toBe(true);
  });

  it("is a no-op for a prod-like database that already has migration history", async () => {
    const db = createTestDb();

    await db.collection<{ _id: string; name: string; checksum: string; appliedAt: Date; executionTimeMs: number }>(
      MIGRATIONS_COLLECTION
    ).insertOne({
      _id: INITIAL_SCHEMA_MIGRATION_ID,
      name: INITIAL_SCHEMA_MIGRATION_NAME,
      checksum: INITIAL_SCHEMA_MIGRATION_CHECKSUM,
      appliedAt: new Date("2026-03-03T12:22:00.000Z"),
      executionTimeMs: 50,
    });

    const result = await applyMigrations({
      db,
      appVersion: "test",
    });

    expect(result.appliedMigrationIds).toEqual([]);

    const appliedMigrations = await db.collection(MIGRATIONS_COLLECTION).find().toArray();
    expect(appliedMigrations).toHaveLength(1);
    expect(appliedMigrations[0]._id).toBe(INITIAL_SCHEMA_MIGRATION_ID);
  });

  it("is idempotent when run twice", async () => {
    const db = createTestDb();

    const firstRun = await applyMigrations({
      db,
      appVersion: "test",
    });
    const secondRun = await applyMigrations({
      db,
      appVersion: "test",
    });

    expect(firstRun.appliedMigrationIds).toEqual([INITIAL_SCHEMA_MIGRATION_ID]);
    expect(secondRun.appliedMigrationIds).toEqual([]);

    const status = await getMigrationStatus({ db });
    expect(status.applied).toHaveLength(1);
    expect(status.applied[0]._id).toBe(INITIAL_SCHEMA_MIGRATION_ID);
    expect(status.pending).toEqual([]);
  });

  it("applies the first guarded migration for an existing database without migration history", async () => {
    const db = createTestDb();

    await db.collection("repertoires").insertOne({
      userId: "existing-user",
      name: "Najdorf",
    });

    const result = await applyMigrations({
      db,
      appVersion: "test",
    });

    expect(result.appliedMigrationIds).toEqual([INITIAL_SCHEMA_MIGRATION_ID]);

    const appliedMigrations = await db.collection<{ _id: string }>(MIGRATIONS_COLLECTION).find().toArray();
    expect(appliedMigrations.map((migration) => migration._id)).toEqual([INITIAL_SCHEMA_MIGRATION_ID]);
  });

  it("skips creating indexes that already exist with the same definition", async () => {
    const db = createTestDb();

    await db.collection("positions").createIndex(
      { fen: 1, userId: 1 },
      { name: "fen_1_userId_1", unique: true }
    );

    const indexesBefore = await db.collection("positions").listIndexes().toArray();

    const result = await applyMigrations({
      db,
      appVersion: "test",
    });

    const indexesAfter = await db.collection("positions").listIndexes().toArray();

    expect(result.appliedMigrationIds).toEqual([INITIAL_SCHEMA_MIGRATION_ID]);
    expect(indexesAfter).toHaveLength(indexesBefore.length + 1);
    expect(indexesAfter.filter((index) => index.name === "fen_1_userId_1")).toHaveLength(1);
    expect(indexesAfter.some((index) => index.name === "userId_1")).toBe(true);
  });

  it("fails clearly when a required index name already exists with a different definition", async () => {
    const db = createTestDb();

    await db.collection("positions").createIndex({ userId: 1 }, { name: "fen_1_userId_1" });

    await expect(
      applyMigrations({
        db,
        appVersion: "test",
      })
    ).rejects.toThrow(
      'Initial schema migration found an incompatible existing index "fen_1_userId_1" on collection "positions".'
    );
  });
});
