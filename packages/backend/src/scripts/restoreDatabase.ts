import fs from "fs";
import path from "path";
import { getMongoToolConfig, resolveFromRepoRoot, runMongoTool } from "./mongoTooling";

const resolveSourceDirectory = (inputPath: string, dbName: string): string => {
  const absolutePath = resolveFromRepoRoot(inputPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Backup path does not exist: ${absolutePath}`);
  }

  const nestedDbDirectory = path.join(absolutePath, dbName);
  if (fs.existsSync(nestedDbDirectory)) {
    return nestedDbDirectory;
  }

  return absolutePath;
};

const main = async () => {
  const sourceArg = process.argv[2];
  if (!sourceArg) {
    throw new Error("Usage: db:restore <backup-path> [--drop]");
  }

  const dropExistingCollections = process.argv.includes("--drop");
  const { uri, dbName } = getMongoToolConfig();
  const sourceDirectory = resolveSourceDirectory(sourceArg, dbName);
  const args = ["--uri", uri, "--db", dbName, sourceDirectory];

  if (dropExistingCollections) {
    args.splice(4, 0, "--drop");
  }

  await runMongoTool("mongorestore", args);
  console.log(`Restored ${dbName} from ${sourceDirectory}`);
};

void main().catch((error) => {
  console.error("Database restore failed:", error);
  process.exit(1);
});
