import fs from "fs";
import os from "os";
import path from "path";
import { resolveMigrationFilePaths } from "../migrations/loader";

describe("migration loader", () => {
  it("resolves checksum from canonical source files and runtime from executable migration files", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "migration-loader-"));
    const canonicalMigrationsDirectory = path.join(tempRoot, "src");
    const runtimeMigrationsDirectory = path.join(tempRoot, "build");
    const fileName = "20260303120000_initial_schema.ts";
    const runtimeFilePath = path.join(runtimeMigrationsDirectory, "20260303120000_initial_schema.js");

    fs.mkdirSync(canonicalMigrationsDirectory, { recursive: true });
    fs.mkdirSync(runtimeMigrationsDirectory, { recursive: true });
    fs.writeFileSync(path.join(canonicalMigrationsDirectory, fileName), "source", "utf8");
    fs.writeFileSync(runtimeFilePath, "runtime", "utf8");

    try {
      expect(
        resolveMigrationFilePaths({
          canonicalMigrationsDirectory,
          runtimeMigrationsDirectory,
          fileName,
        })
      ).toEqual({
        checksumFilePath: path.join(canonicalMigrationsDirectory, fileName),
        runtimeFilePath,
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
