import AdmZip from "adm-zip";
import { ObjectId } from "mongodb";
import { connectDB, getDB } from "../db/mongo";
import {
  USER_ACCOUNT_BACKUP_FILE_NAME,
  USER_COLLECTION_BACKUPS,
} from "./userBackupService";
import { parseBackupJsonArray } from "./userBackupSerialization";

type ErrorWithStatus = Error & { status?: number };

export interface UserRestoreResult {
  userId: string;
  restoredCounts: Record<string, number>;
}

const createStatusError = (message: string, status: number): ErrorWithStatus => {
  const error = new Error(message) as ErrorWithStatus;
  error.status = status;
  return error;
};

const REQUIRED_BACKUP_FILE_NAMES = [
  USER_ACCOUNT_BACKUP_FILE_NAME,
  ...USER_COLLECTION_BACKUPS.map(({ fileName }) => fileName),
];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseJsonArray = (zip: AdmZip, fileName: string): unknown[] => {
  const entry = zip.getEntry(fileName);
  if (!entry) {
    throw createStatusError(`Backup file "${fileName}" is missing`, 400);
  }
  const raw = zip.readAsText(entry);
  try {
    return parseBackupJsonArray(raw);
  } catch {
    throw createStatusError(`Backup file "${fileName}" must contain a JSON array`, 400);
  }
};

const normalizeDocumentId = (value: unknown): unknown => {
  if (!isPlainObject(value) || !("_id" in value)) {
    return value;
  }
  const documentId = value._id;
  const documentIdString = getDocumentIdString(documentId);
  if (!documentIdString) {
    return value;
  }
  if (!ObjectId.isValid(documentIdString)) {
    return value;
  }
  return {
    ...value,
    _id: new ObjectId(documentIdString),
  };
};

const getDocumentIdString = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toHexString" in value &&
    typeof value.toHexString === "function"
  ) {
    return value.toHexString();
  }
  if (value instanceof ObjectId) {
    return value.toHexString();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    const stringValue = value.toString();
    if (ObjectId.isValid(stringValue)) {
      return stringValue;
    }
  }
  return null;
};

const isTransactionSupportError = (error: unknown): boolean =>
  error instanceof Error &&
  error.message.includes("Transaction numbers are only allowed on a replica set member or mongos");

const validateUserDocument = (userId: string, users: unknown[]): Record<string, unknown> => {
  if (users.length !== 1 || !isPlainObject(users[0])) {
    throw createStatusError(`Backup file "${USER_ACCOUNT_BACKUP_FILE_NAME}" must contain exactly one user document`, 400);
  }
  const user = users[0];
  if (getDocumentIdString(user._id) !== userId) {
    throw createStatusError("Backup user does not match the current authenticated user", 400);
  }
  return normalizeDocumentId(user) as Record<string, unknown>;
};

const validateUserScopedDocuments = (userId: string, fileName: string, documents: unknown[]): Record<string, unknown>[] => {
  return documents.map((document) => {
    if (!isPlainObject(document)) {
      throw createStatusError(`Backup file "${fileName}" must contain only JSON objects`, 400);
    }
    if (document.userId !== userId) {
      throw createStatusError(`Backup file "${fileName}" contains data for a different user`, 400);
    }
    return normalizeDocumentId(document) as Record<string, unknown>;
  });
};

const validateBackupEntries = (zip: AdmZip): void => {
  const entryNames = zip
    .getEntries()
    .filter((entry) => !entry.isDirectory)
    .map((entry) => entry.entryName);

  const duplicates = entryNames.filter((entryName, index) => entryNames.indexOf(entryName) !== index);
  if (duplicates.length > 0) {
    throw createStatusError(`Backup contains duplicate file entries: ${duplicates.join(", ")}`, 400);
  }

  const unsupportedEntries = entryNames.filter((entryName) => !REQUIRED_BACKUP_FILE_NAMES.includes(entryName));
  if (unsupportedEntries.length > 0) {
    throw createStatusError(`Backup contains unsupported files: ${unsupportedEntries.join(", ")}`, 400);
  }

  const missingEntries = REQUIRED_BACKUP_FILE_NAMES.filter((entryName) => !entryNames.includes(entryName));
  if (missingEntries.length > 0) {
    throw createStatusError(`Backup is missing required files: ${missingEntries.join(", ")}`, 400);
  }
};

export async function restoreUserBackup(userId: string, zipBuffer: Buffer): Promise<UserRestoreResult> {
  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch {
    throw createStatusError("Invalid backup zip file", 400);
  }

  validateBackupEntries(zip);

  const restoredCounts: Record<string, number> = {};
  const userDocument = validateUserDocument(userId, parseJsonArray(zip, USER_ACCOUNT_BACKUP_FILE_NAME));
  const scopedDocumentsByCollection = USER_COLLECTION_BACKUPS.map(({ fileName, collectionName }) => {
    const documents = validateUserScopedDocuments(userId, fileName, parseJsonArray(zip, fileName));
    restoredCounts[collectionName] = documents.length;
    return {
      collectionName,
      documents,
    };
  });
  restoredCounts.users = 1;

  const client = await connectDB();
  const db = getDB();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db
        .collection("users")
        .replaceOne({ _id: new ObjectId(userId) }, userDocument, { upsert: true, session });

      for (const { collectionName, documents } of scopedDocumentsByCollection) {
        const collection = db.collection(collectionName);
        await collection.deleteMany({ userId }, { session });
        if (documents.length > 0) {
          await collection.insertMany(documents, { session });
        }
      }
    });
  } catch (error) {
    if (isTransactionSupportError(error)) {
      throw createStatusError(
        "Restore requires MongoDB transaction support (replica set or mongos)",
        503
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return {
    userId,
    restoredCounts,
  };
}
