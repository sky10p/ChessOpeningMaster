import { DEFAULT_MIGRATION_LEASE_MS } from "./constants";

export const getConfiguredMigrationLeaseMs = (env: NodeJS.ProcessEnv = process.env): number => {
  const rawLeaseMs = env.MIGRATIONS_LEASE_MS;
  const parsedLeaseMs = rawLeaseMs ? Number(rawLeaseMs) : DEFAULT_MIGRATION_LEASE_MS;

  if (!Number.isFinite(parsedLeaseMs) || parsedLeaseMs <= 0) {
    return DEFAULT_MIGRATION_LEASE_MS;
  }

  return Math.trunc(parsedLeaseMs);
};
