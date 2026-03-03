import fs from "fs";
import path from "path";
import { getMongoToolConfig, getTimestampPrefix, runMongoTool, sanitizePathToken } from "./mongoTooling";

const createBackupDirectory = (dbName: string, label?: string): string => {
  const { backupRootDirectory } = getMongoToolConfig();
  fs.mkdirSync(backupRootDirectory, { recursive: true });
  const normalizedLabel = label ? sanitizePathToken(label) : "";
  const suffix = normalizedLabel ? `_${normalizedLabel}` : "";
  return path.join(backupRootDirectory, `${getTimestampPrefix()}_${sanitizePathToken(dbName)}${suffix}`);
};

const writeMetadata = (backupDirectory: string, dbName: string): void => {
  fs.writeFileSync(
    path.join(backupDirectory, "metadata.json"),
    JSON.stringify(
      {
        dbName,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
};

const main = async () => {
  const label = process.argv[2];
  const { uri, dbName } = getMongoToolConfig();
  const backupDirectory = createBackupDirectory(dbName, label);
  fs.mkdirSync(backupDirectory, { recursive: true });

  await runMongoTool("mongodump", ["--uri", uri, "--db", dbName, "--out", backupDirectory]);
  writeMetadata(backupDirectory, dbName);
  console.log(backupDirectory);
};

void main().catch((error) => {
  console.error("Database backup failed:", error);
  process.exit(1);
});
