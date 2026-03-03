import { randomUUID } from "crypto";
import { Db } from "mongodb";
import { DEFAULT_MIGRATION_LEASE_MS, GLOBAL_MIGRATION_LOCK_ID, MIGRATION_LOCKS_COLLECTION } from "./constants";
import { AcquireMigrationLockOptions, HeldMigrationLock } from "./types";

type MigrationLockDocument = {
  _id: string;
  ownerId: string;
  expiresAt: Date;
};

const isDuplicateKeyError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const mongoError = error as { code?: number; codeName?: string };
  return mongoError.code === 11000 || mongoError.codeName === "DuplicateKey";
};

const acquireOnce = async (db: Db, ownerId: string, leaseMs: number): Promise<boolean> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + leaseMs);
  const collection = db.collection<MigrationLockDocument>(MIGRATION_LOCKS_COLLECTION);
  const updateResult = await collection.updateOne(
    {
      _id: GLOBAL_MIGRATION_LOCK_ID,
      $or: [{ ownerId }, { expiresAt: { $lt: now } }, { expiresAt: { $exists: false } }],
    },
    {
      $set: {
        ownerId,
        expiresAt,
      },
    }
  );

  if (updateResult.matchedCount > 0) {
    return true;
  }

  try {
    await collection.insertOne({
      _id: GLOBAL_MIGRATION_LOCK_ID,
      ownerId,
      expiresAt,
    });
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return false;
    }
    throw error;
  }
};

export const acquireMigrationLock = async (
  db: Db,
  options: AcquireMigrationLockOptions
): Promise<HeldMigrationLock> => {
  const ownerId = options.ownerId || randomUUID();
  const leaseMs = options.leaseMs ?? DEFAULT_MIGRATION_LEASE_MS;
  const collection = db.collection<MigrationLockDocument>(MIGRATION_LOCKS_COLLECTION);

  if (!(await acquireOnce(db, ownerId, leaseMs))) {
    throw new Error("Could not acquire the migration lock. Another process is currently running migrations.");
  }

  let released = false;

  const refresh = async (): Promise<void> => {
    await collection.updateOne(
      { _id: GLOBAL_MIGRATION_LOCK_ID, ownerId },
      {
        $set: {
          expiresAt: new Date(Date.now() + leaseMs),
        },
      }
    );
  };

  const release = async (): Promise<void> => {
    if (released) {
      return;
    }
    released = true;
    await collection.deleteOne({
      _id: GLOBAL_MIGRATION_LOCK_ID,
      ownerId,
    });
  };

  options.logger.info("Acquired migration lock", { ownerId, leaseMs });

  return {
    ownerId,
    refresh,
    release,
  };
};
