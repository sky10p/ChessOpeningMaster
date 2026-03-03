import fs from "fs";
import path from "path";
import { getConfiguredMigrationLeaseMs } from "../db/migrations/config";
import { connectDB, disconnectDB, getDB } from "../db/mongo";
import { applyMigrations, getMigrationStatus } from "../db/migrations/runner";
import { getWritableMigrationsDirectory } from "../db/migrations/loader";

const sanitizeMigrationName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getTimestampId = (): string => {
  const now = new Date();
  const parts = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ];
  return parts.join("");
};

const getAppVersion = (): string | undefined => process.env.npm_package_version || undefined;

const printStatus = async (): Promise<void> => {
  await connectDB();
  const status = await getMigrationStatus({ db: getDB() });

  console.log(`Applied: ${status.applied.length}`);
  console.log(`Pending: ${status.pending.length}`);
  status.applied.forEach((migration) => {
    console.log(`APPLIED ${migration._id} ${migration.name}`);
  });
  status.pending.forEach((migration) => {
    console.log(`PENDING ${migration.id} ${migration.name}`);
  });
};

const runApply = async (): Promise<void> => {
  await connectDB();
  const db = getDB();
  const result = await applyMigrations({
    db,
    appVersion: getAppVersion(),
    leaseMs: getConfiguredMigrationLeaseMs(),
  });

  console.log(`Applied migrations: ${result.appliedMigrationIds.length}`);
  result.appliedMigrationIds.forEach((migrationId) => console.log(`APPLIED ${migrationId}`));
};

const createMigrationFile = async (name: string): Promise<void> => {
  const normalizedName = sanitizeMigrationName(name);
  if (!normalizedName) {
    throw new Error("Migration name is required");
  }

  const migrationId = `${getTimestampId()}_${normalizedName}`;
  const migrationDirectory = getWritableMigrationsDirectory();
  fs.mkdirSync(migrationDirectory, { recursive: true });
  const filePath = path.join(migrationDirectory, `${migrationId}.ts`);

  if (fs.existsSync(filePath)) {
    throw new Error(`Migration file already exists: ${filePath}`);
  }

  const fileContent = `import { MigrationDefinition } from "../types";

export const migration: MigrationDefinition = {
  id: "${migrationId}",
  name: "${normalizedName.replace(/_/g, " ")}",
  up: async (_db) => {},
};
`;

  fs.writeFileSync(filePath, fileContent, "utf8");
  console.log(filePath);
};

const main = async () => {
  const command = process.argv[2] || "migrate";

  try {
    if (command === "migrate") {
      await runApply();
      return;
    }

    if (command === "migrate:status") {
      await printStatus();
      return;
    }

    if (command === "migrate:create") {
      const name = process.argv[3];
      if (!name) {
        throw new Error("Usage: migrate:create <name>");
      }
      await createMigrationFile(name);
      return;
    }

    throw new Error(`Unknown command "${command}"`);
  } finally {
    await disconnectDB();
  }
};

void main().catch((error) => {
  console.error("Migration command failed:", error);
  process.exit(1);
});
