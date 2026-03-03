import { DEFAULT_MIGRATION_LEASE_MS } from "../migrations/constants";
import { getConfiguredMigrationLeaseMs } from "../migrations/config";

describe("migration config", () => {
  it("reads MIGRATIONS_LEASE_MS when it is a positive number", () => {
    expect(
      getConfiguredMigrationLeaseMs({
        MIGRATIONS_LEASE_MS: "45000",
      })
    ).toBe(45000);
  });

  it("falls back to the default lease when MIGRATIONS_LEASE_MS is invalid", () => {
    expect(
      getConfiguredMigrationLeaseMs({
        MIGRATIONS_LEASE_MS: "not-a-number",
      })
    ).toBe(DEFAULT_MIGRATION_LEASE_MS);
  });
});
