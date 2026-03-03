import { createHash } from "crypto";
import fs from "fs";
import { createRequire } from "module";
import path from "path";
import { LoadedMigration, MigrationDefinition } from "./types";

const migrationFilePattern = /^\d{14}_[a-z0-9_-]+\.(ts|js)$/i;
const requireModule = createRequire(__filename);
const supportedMigrationExtensions = [".ts", ".js"];

const toChecksum = (content: string): string => createHash("sha256").update(content).digest("hex");

const getMigrationFiles = (directoryPath: string): string[] =>
  fs
    .readdirSync(directoryPath)
    .filter((fileName) => migrationFilePattern.test(fileName) && !fileName.endsWith(".d.ts"))
    .sort();

const loadMigrationModule = (filePath: string): MigrationDefinition => {
  const loadedModule = requireModule(filePath) as {
    migration?: MigrationDefinition;
    default?: MigrationDefinition;
  };

  const migration = loadedModule.migration || loadedModule.default;
  if (!migration) {
    throw new Error(`Migration file "${filePath}" does not export a migration object`);
  }

  return migration;
};

export const getRuntimeMigrationsDirectory = (): string => path.join(__dirname, "definitions");

const getSourceMigrationsDirectoryCandidates = (): string[] => [
  path.resolve(process.cwd(), "packages/backend/src/db/migrations/definitions"),
  path.resolve(process.cwd(), "src/db/migrations/definitions"),
];

const getExistingSourceMigrationsDirectory = (): string | null => {
  const candidate = getSourceMigrationsDirectoryCandidates().find((directoryPath) => fs.existsSync(directoryPath));
  return candidate || null;
};

export const getWritableMigrationsDirectory = (): string => {
  const existingSourceDirectory = getExistingSourceMigrationsDirectory();
  if (existingSourceDirectory) {
    return existingSourceDirectory;
  }

  const repoRootCandidate = path.resolve(process.cwd(), "packages/backend/src/db/migrations/definitions");
  if (fs.existsSync(path.dirname(repoRootCandidate))) {
    return repoRootCandidate;
  }

  const packageRootCandidate = path.resolve(process.cwd(), "src/db/migrations/definitions");
  if (fs.existsSync(path.dirname(packageRootCandidate))) {
    return packageRootCandidate;
  }

  return path.resolve(__dirname, "definitions");
};

const resolveRuntimeMigrationFilePath = (runtimeDirectoryPath: string, fileName: string): string => {
  const fileBaseName = path.basename(fileName, path.extname(fileName));
  const runtimeFilePath = supportedMigrationExtensions
    .map((extension) => path.join(runtimeDirectoryPath, `${fileBaseName}${extension}`))
    .find((candidatePath) => fs.existsSync(candidatePath));

  if (!runtimeFilePath) {
    throw new Error(`Migration runtime file for "${fileBaseName}" was not found in "${runtimeDirectoryPath}".`);
  }

  return runtimeFilePath;
};

export const resolveMigrationFilePaths = ({
  canonicalMigrationsDirectory,
  runtimeMigrationsDirectory,
  fileName,
}: {
  canonicalMigrationsDirectory: string;
  runtimeMigrationsDirectory: string;
  fileName: string;
}): { checksumFilePath: string; runtimeFilePath: string } => ({
  checksumFilePath: path.join(canonicalMigrationsDirectory, fileName),
  runtimeFilePath: resolveRuntimeMigrationFilePath(runtimeMigrationsDirectory, fileName),
});

export const loadMigrations = (): LoadedMigration[] => {
  const runtimeMigrationsDirectory = getRuntimeMigrationsDirectory();
  if (!fs.existsSync(runtimeMigrationsDirectory)) {
    return [];
  }
  const canonicalMigrationsDirectory = getExistingSourceMigrationsDirectory() || runtimeMigrationsDirectory;
  const migrationFiles = getMigrationFiles(canonicalMigrationsDirectory);
  const seenIds = new Set<string>();

  return migrationFiles.map((fileName) => {
    const { checksumFilePath, runtimeFilePath } = resolveMigrationFilePaths({
      canonicalMigrationsDirectory,
      runtimeMigrationsDirectory,
      fileName,
    });
    const fileContent = fs.readFileSync(checksumFilePath, "utf8");
    const migration = loadMigrationModule(runtimeFilePath);
    const expectedId = path.basename(fileName, path.extname(fileName));

    if (migration.id !== expectedId) {
      throw new Error(
        `Migration "${fileName}" exports id "${migration.id}" but expected "${expectedId}"`
      );
    }

    if (seenIds.has(migration.id)) {
      throw new Error(`Duplicate migration id "${migration.id}"`);
    }

    seenIds.add(migration.id);

    return {
      id: migration.id,
      name: migration.name,
      checksum: toChecksum(fileContent),
      filePath: runtimeFilePath,
      migration,
    };
  });
};
