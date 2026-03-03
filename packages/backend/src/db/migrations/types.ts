import { Db } from "mongodb";

export type MigrationLogger = {
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => void;
};

export type MigrationDefinition = {
  id: string;
  name: string;
  up: (db: Db) => Promise<void>;
};

export type LoadedMigration = {
  id: string;
  name: string;
  checksum: string;
  filePath: string;
  migration: MigrationDefinition;
};

export type AppliedMigrationRecord = {
  _id: string;
  name: string;
  checksum: string;
  appliedAt: Date;
  executionTimeMs: number;
  appVersion?: string;
  meta?: Record<string, unknown>;
};

export type MigrationStatus = {
  applied: AppliedMigrationRecord[];
  pending: LoadedMigration[];
};

export type AcquireMigrationLockOptions = {
  ownerId?: string;
  leaseMs?: number;
  logger: MigrationLogger;
};

export type HeldMigrationLock = {
  ownerId: string;
  refresh: () => Promise<void>;
  release: () => Promise<void>;
};

export type ApplyMigrationsOptions = {
  db: Db;
  appVersion?: string;
  logger?: MigrationLogger;
  leaseMs?: number;
};

export type ApplyMigrationsResult = {
  appliedMigrationIds: string[];
};
