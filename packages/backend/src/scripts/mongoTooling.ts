import { spawn } from "child_process";
import path from "path";

type MongoToolConfig = {
  uri: string;
  dbName: string;
  backupRootDirectory: string;
};

const defaultUri = "mongodb://localhost:27017/chess_opening_master";
const defaultDbName = "chess-opening-master";

export const getRepoRoot = (): string => path.resolve(__dirname, "../../../../");

export const resolveFromRepoRoot = (value: string): string =>
  path.isAbsolute(value) ? value : path.join(getRepoRoot(), value);

export const getMongoToolConfig = (): MongoToolConfig => ({
  uri: process.env.MONGODB_URI || process.env.MONGO_URI || defaultUri,
  dbName: process.env.MONGODB_DB_NAME || process.env.MONGO_DB_NAME || defaultDbName,
  backupRootDirectory: resolveFromRepoRoot(process.env.MONGODB_BACKUP_DIR || ".mongo-backups"),
});

export const getTimestampPrefix = (): string => {
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

export const sanitizePathToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const runMongoTool = (command: string, args: string[]): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: getRepoRoot(),
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        reject(new Error(`"${command}" was not found in PATH. Install MongoDB Database Tools first.`));
        return;
      }

      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`"${command}" exited with code ${code ?? "unknown"}.`));
    });
  });
