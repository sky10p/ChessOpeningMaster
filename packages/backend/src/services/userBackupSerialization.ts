import { EJSON } from "bson";

const DATE_FIELD_NAMES = new Set([
  "archivedAt",
  "connectedAt",
  "createdAt",
  "dueAt",
  "dueBeforeReviewAt",
  "generatedAtDate",
  "lastDate",
  "lastReviewedAt",
  "lastSyncAt",
  "lastSyncFinishedAt",
  "lastSyncStartedAt",
  "masteryUpdatedAt",
  "nextDueAt",
  "playedAt",
  "reviewedAt",
  "suspendedUntil",
  "updatedAt",
]);

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

const reviveLegacyDateFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(reviveLegacyDateFields);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, currentValue]) => {
      if (
        DATE_FIELD_NAMES.has(key) &&
        typeof currentValue === "string" &&
        ISO_DATE_PATTERN.test(currentValue)
      ) {
        return [key, new Date(currentValue)];
      }
      return [key, reviveLegacyDateFields(currentValue)];
    })
  );
};

export const stringifyBackupJsonValue = (value: unknown): string =>
  EJSON.stringify(value, undefined, 2, { relaxed: false });

export const parseBackupJsonArray = (raw: string): unknown[] => {
  const parsed = EJSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Backup file must contain an array");
  }
  return reviveLegacyDateFields(parsed) as unknown[];
};
