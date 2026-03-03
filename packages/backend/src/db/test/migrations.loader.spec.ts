import fs from "fs";
import os from "os";
import path from "path";
import { resolveMigrationFilePaths } from "../migrations/loader";

describe("migration loader", () => {
  it("resolves canonical checksum and runtime file paths", () => {
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

  it("prefers runtime JavaScript files over TypeScript files when both exist", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "migration-loader-"));
    const canonicalMigrationsDirectory = path.join(tempRoot, "src");
    const runtimeMigrationsDirectory = path.join(tempRoot, "build");
    const fileName = "20260303120000_initial_schema.ts";
    const runtimeJavaScriptFilePath = path.join(runtimeMigrationsDirectory, "20260303120000_initial_schema.js");
    const runtimeTypeScriptFilePath = path.join(runtimeMigrationsDirectory, "20260303120000_initial_schema.ts");

    fs.mkdirSync(canonicalMigrationsDirectory, { recursive: true });
    fs.mkdirSync(runtimeMigrationsDirectory, { recursive: true });
    fs.writeFileSync(path.join(canonicalMigrationsDirectory, fileName), "source", "utf8");
    fs.writeFileSync(runtimeJavaScriptFilePath, "runtime-js", "utf8");
    fs.writeFileSync(runtimeTypeScriptFilePath, "runtime-ts", "utf8");

    try {
      expect(
        resolveMigrationFilePaths({
          canonicalMigrationsDirectory,
          runtimeMigrationsDirectory,
          fileName,
        }).runtimeFilePath
      ).toBe(runtimeJavaScriptFilePath);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("includes checked runtime file paths in the missing-runtime error", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "migration-loader-"));
    const canonicalMigrationsDirectory = path.join(tempRoot, "src");
    const runtimeMigrationsDirectory = path.join(tempRoot, "build");
    const fileName = "20260303120000_initial_schema.ts";
    const expectedJavaScriptRuntimeFilePath = path.join(runtimeMigrationsDirectory, "20260303120000_initial_schema.js");
    const expectedTypeScriptRuntimeFilePath = path.join(runtimeMigrationsDirectory, "20260303120000_initial_schema.ts");

    fs.mkdirSync(canonicalMigrationsDirectory, { recursive: true });
    fs.mkdirSync(runtimeMigrationsDirectory, { recursive: true });
    fs.writeFileSync(path.join(canonicalMigrationsDirectory, fileName), "source", "utf8");

    try {
      expect(() =>
        resolveMigrationFilePaths({
          canonicalMigrationsDirectory,
          runtimeMigrationsDirectory,
          fileName,
        })
      ).toThrow(
        `Migration runtime file for "20260303120000_initial_schema" was not found. Checked: ${expectedJavaScriptRuntimeFilePath}, ${expectedTypeScriptRuntimeFilePath}. The build output may be stale or incomplete.`
      );
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
