import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createHash, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import * as loader from "../migrations/loader";
import { GLOBAL_MIGRATION_LOCK_ID, MIGRATION_LOCKS_COLLECTION, MIGRATIONS_COLLECTION } from "../migrations/constants";
import { applyMigrations, getMigrationStatus } from "../migrations/runner";

jest.setTimeout(60000);

const INITIAL_SCHEMA_MIGRATION_ID = "20260303120000_initial_schema";
const INITIAL_SCHEMA_MIGRATION_NAME = "initial schema";
const LEGACY_USER_SCOPE_BACKFILL_MIGRATION_ID = "20260303123000_backfill_legacy_user_scope";
const LEGACY_USER_SCOPE_BACKFILL_MIGRATION_NAME = "backfill legacy user scope";
const REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_ID = "20260303130000_backfill_repertoire_favorites";
const REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_NAME = "backfill repertoire favorites";
const getMigrationChecksum = (fileName: string): string =>
  createHash("sha256")
    .update(fs.readFileSync(path.resolve(__dirname, `../migrations/definitions/${fileName}`), "utf8"))
    .digest("hex");
const INITIAL_SCHEMA_MIGRATION_CHECKSUM = getMigrationChecksum("20260303120000_initial_schema.ts");
const LEGACY_USER_SCOPE_BACKFILL_MIGRATION_CHECKSUM = getMigrationChecksum(
  "20260303123000_backfill_legacy_user_scope.ts"
);
const REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_CHECKSUM = getMigrationChecksum(
  "20260303130000_backfill_repertoire_favorites.ts"
);
const BASELINE_MIGRATION_IDS = [
  INITIAL_SCHEMA_MIGRATION_ID,
  LEGACY_USER_SCOPE_BACKFILL_MIGRATION_ID,
  REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_ID,
];

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

    expect(result.appliedMigrationIds).toEqual(BASELINE_MIGRATION_IDS);

    const appliedMigrations = await db.collection<{ _id: string }>(MIGRATIONS_COLLECTION).find().toArray();
    expect(appliedMigrations.map((migration) => migration._id)).toEqual(BASELINE_MIGRATION_IDS);

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
    ).insertMany([
      {
        _id: INITIAL_SCHEMA_MIGRATION_ID,
        name: INITIAL_SCHEMA_MIGRATION_NAME,
        checksum: INITIAL_SCHEMA_MIGRATION_CHECKSUM,
        appliedAt: new Date("2026-03-03T12:22:00.000Z"),
        executionTimeMs: 50,
      },
      {
        _id: LEGACY_USER_SCOPE_BACKFILL_MIGRATION_ID,
        name: LEGACY_USER_SCOPE_BACKFILL_MIGRATION_NAME,
        checksum: LEGACY_USER_SCOPE_BACKFILL_MIGRATION_CHECKSUM,
        appliedAt: new Date("2026-03-03T12:22:10.000Z"),
        executionTimeMs: 25,
      },
      {
        _id: REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_ID,
        name: REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_NAME,
        checksum: REPERTOIRE_FAVORITES_BACKFILL_MIGRATION_CHECKSUM,
        appliedAt: new Date("2026-03-03T12:22:20.000Z"),
        executionTimeMs: 10,
      },
    ]);

    const result = await applyMigrations({
      db,
      appVersion: "test",
    });

    expect(result.appliedMigrationIds).toEqual([]);

    const appliedMigrations = await db.collection(MIGRATIONS_COLLECTION).find().toArray();
    expect(appliedMigrations).toHaveLength(BASELINE_MIGRATION_IDS.length);
    expect(appliedMigrations.map((migration) => migration._id)).toEqual(BASELINE_MIGRATION_IDS);
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

    expect(firstRun.appliedMigrationIds).toEqual(BASELINE_MIGRATION_IDS);
    expect(secondRun.appliedMigrationIds).toEqual([]);

    const status = await getMigrationStatus({ db });
    expect(status.applied).toHaveLength(BASELINE_MIGRATION_IDS.length);
    expect(status.applied.map((migration) => migration._id)).toEqual(BASELINE_MIGRATION_IDS);
    expect(status.pending).toEqual([]);
  });

  it("applies baseline migrations and backfills legacy documents into the default user scope", async () => {
    const db = createTestDb();

    await db.collection("repertoires").insertOne({
      name: "Najdorf",
    });
    await db.collection("studies").insertOne({
      title: "French Defense",
    });
    await db.collection("positions").insertOne({
      fen: "legacy-fen",
      comment: "Legacy comment",
    });
    await db.collection("variantsInfo").insertOne({
      repertoireId: "rep-1",
      variantName: "main line",
    });

    const result = await applyMigrations({
      db,
      appVersion: "test",
    });

    expect(result.appliedMigrationIds).toEqual(BASELINE_MIGRATION_IDS);

    const appliedMigrations = await db.collection<{ _id: string }>(MIGRATIONS_COLLECTION).find().toArray();
    expect(appliedMigrations.map((migration) => migration._id)).toEqual(BASELINE_MIGRATION_IDS);

    const defaultUser = await db.collection<{ _id: unknown; username: string }>("users").findOne({
      username: "default",
    });

    expect(defaultUser).toBeTruthy();
    if (!defaultUser) {
      throw new Error("Expected default user to be created by legacy scope backfill migration");
    }

    const defaultUserId = String(defaultUser._id);
    expect(await db.collection("repertoires").findOne({ name: "Najdorf", userId: defaultUserId })).toBeTruthy();
    expect(await db.collection("studies").findOne({ title: "French Defense", userId: defaultUserId })).toBeTruthy();
    expect(await db.collection("positions").findOne({ fen: "legacy-fen", userId: defaultUserId })).toBeTruthy();
    expect(
      await db.collection("variantsInfo").findOne({ repertoireId: "rep-1", variantName: "main line", userId: defaultUserId })
    ).toBeTruthy();
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

    expect(result.appliedMigrationIds).toEqual(BASELINE_MIGRATION_IDS);
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

  it("refreshes the lock lease while a migration is still running", async () => {
    const db = createTestDb();
    const migrationId = "20260303123000_slow_migration";
    let leaseStayedActiveDuringRun = false;
    const loadMigrationsSpy = jest.spyOn(loader, "loadMigrations").mockReturnValue([
      {
        id: migrationId,
        name: "slow migration",
        checksum: "slow-checksum",
        filePath: "slow-migration.ts",
        migration: {
          id: migrationId,
          name: "slow migration",
          up: async (currentDb) => {
            await new Promise((resolve) => setTimeout(resolve, 170));
            const lockDocument = await currentDb
              .collection<{ _id: string; expiresAt: Date }>(MIGRATION_LOCKS_COLLECTION)
              .findOne({ _id: GLOBAL_MIGRATION_LOCK_ID });
            leaseStayedActiveDuringRun = Boolean(
              lockDocument && lockDocument.expiresAt instanceof Date && lockDocument.expiresAt.getTime() > Date.now()
            );
          },
        },
      },
    ]);

    try {
      const result = await applyMigrations({
        db,
        appVersion: "test",
        leaseMs: 100,
      });

      expect(result.appliedMigrationIds).toEqual([migrationId]);
      expect(leaseStayedActiveDuringRun).toBe(true);
    } finally {
      loadMigrationsSpy.mockRestore();
    }
  });
});
