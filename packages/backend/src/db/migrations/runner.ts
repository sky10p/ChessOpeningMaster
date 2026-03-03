import { Db } from "mongodb";
import { MIGRATION_LOCKS_COLLECTION, MIGRATIONS_COLLECTION } from "./constants";
import { loadMigrations } from "./loader";
import { acquireMigrationLock } from "./lock";
import {
  AppliedMigrationRecord,
  ApplyMigrationsOptions,
  ApplyMigrationsResult,
  MigrationLogger,
  MigrationStatus,
} from "./types";
import { logError, logInfo, logWarn } from "../../utils/logger";

const createMigrationLogger = (): MigrationLogger => ({
  info: (message, context) => {
    logInfo(message, context);
  },
  warn: (message, context) => {
    logWarn(message, context);
  },
  error: (message, error, context) => {
    logError(message, error, context);
  },
});

const ensureMetadataCollections = async (db: Db): Promise<void> => {
  await db.collection(MIGRATIONS_COLLECTION).createIndex({ appliedAt: 1 }, { name: "appliedAt_1" });
  await db.collection(MIGRATION_LOCKS_COLLECTION).createIndex({ expiresAt: 1 }, { name: "expiresAt_1" });
};

const readAppliedMigrations = async (db: Db): Promise<AppliedMigrationRecord[]> =>
  db.collection<AppliedMigrationRecord>(MIGRATIONS_COLLECTION).find().sort({ _id: 1 }).toArray();

const buildAppliedMap = (appliedMigrations: AppliedMigrationRecord[]): Map<string, AppliedMigrationRecord> =>
  new Map(appliedMigrations.map((migration) => [migration._id, migration]));

const assertNoChecksumDrift = (
  migrations: ReturnType<typeof loadMigrations>,
  appliedMigrations: AppliedMigrationRecord[]
): void => {
  const migrationMap = new Map(migrations.map((migration) => [migration.id, migration]));

  for (const appliedMigration of appliedMigrations) {
    const localMigration = migrationMap.get(appliedMigration._id);
    if (!localMigration) {
      continue;
    }

    if (localMigration.checksum !== appliedMigration.checksum) {
      throw new Error(
        `Checksum drift detected for applied migration "${appliedMigration._id}". Restore the original file, create a new migration, or repair __migrations after manual audit.`
      );
    }
  }
};

const getLogger = (logger?: MigrationLogger): MigrationLogger => logger || createMigrationLogger();

export const getMigrationStatus = async ({ db }: { db: Db }): Promise<MigrationStatus> => {
  await ensureMetadataCollections(db);
  const migrations = loadMigrations();
  const appliedMigrations = await readAppliedMigrations(db);
  assertNoChecksumDrift(migrations, appliedMigrations);
  const appliedMap = buildAppliedMap(appliedMigrations);
  const pending = migrations.filter((migration) => !appliedMap.has(migration.id));

  return {
    applied: appliedMigrations,
    pending,
  };
};

export const applyMigrations = async ({
  db,
  appVersion,
  logger: providedLogger,
  leaseMs,
}: ApplyMigrationsOptions): Promise<ApplyMigrationsResult> => {
  const logger = getLogger(providedLogger);
  logger.info("Checking migration status");
  await ensureMetadataCollections(db);
  const heldLock = await acquireMigrationLock(db, {
    logger,
    leaseMs,
  });

  try {
    const migrations = loadMigrations();
    const appliedMigrations = await readAppliedMigrations(db);
    assertNoChecksumDrift(migrations, appliedMigrations);

    const appliedMap = buildAppliedMap(appliedMigrations);
    const pendingMigrations = migrations.filter((migration) => !appliedMap.has(migration.id));
    logger.info("Migration status ready", {
      appliedCount: appliedMigrations.length,
      pendingCount: pendingMigrations.length,
    });

    const appliedMigrationIds: string[] = [];

    if (pendingMigrations.length === 0) {
      logger.info("No pending migrations");
    }

    for (const migration of pendingMigrations) {
      await heldLock.refresh();
      const startedAt = Date.now();
      logger.info("Applying migration", { migrationId: migration.id, name: migration.name });
      await migration.migration.up(db);
      const executionTimeMs = Date.now() - startedAt;
      await db.collection<AppliedMigrationRecord>(MIGRATIONS_COLLECTION).insertOne({
        _id: migration.id,
        name: migration.name,
        checksum: migration.checksum,
        appliedAt: new Date(),
        executionTimeMs,
        ...(appVersion ? { appVersion } : {}),
      });
      appliedMigrationIds.push(migration.id);
      logger.info("Applied migration", {
        migrationId: migration.id,
        executionTimeMs,
      });
    }

    logger.info("Migration run completed", {
      appliedCount: appliedMigrationIds.length,
      appliedMigrationIds,
    });

    return {
      appliedMigrationIds,
    };
  } finally {
    await heldLock.release();
  }
};

export const runMigrationsForStartup = async ({
  db,
  appVersion,
  logger,
}: {
  db: Db;
  appVersion?: string;
  logger?: MigrationLogger;
}): Promise<ApplyMigrationsResult> => {
  const status = await getMigrationStatus({ db });
  if (status.pending.length === 0) {
    return {
      appliedMigrationIds: [],
    };
  }

  return applyMigrations({
    db,
    appVersion,
    logger,
  });
};
