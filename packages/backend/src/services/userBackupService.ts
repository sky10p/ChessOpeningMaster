import { ObjectId, Sort } from "mongodb";
import { getDB } from "../db/mongo";

export interface UserBackupFile {
  fileName: string;
  jsonValue: unknown;
}

export const USER_ACCOUNT_BACKUP_FILE_NAME = "users.json";

type UserCollectionBackupDefinition = {
  fileName: string;
  collectionName: string;
  sort: Sort;
};

export const USER_COLLECTION_BACKUPS: readonly UserCollectionBackupDefinition[] = [
  {
    fileName: "repertoires.json",
    collectionName: "repertoires",
    sort: { order: 1, _id: 1 },
  },
  {
    fileName: "studies.json",
    collectionName: "studies",
    sort: { name: 1, _id: 1 },
  },
  {
    fileName: "variantsInfo.json",
    collectionName: "variantsInfo",
    sort: { repertoireId: 1, variantName: 1, _id: 1 },
  },
  {
    fileName: "positions.json",
    collectionName: "positions",
    sort: { fen: 1, _id: 1 },
  },
  {
    fileName: "variantReviewHistory.json",
    collectionName: "variantReviewHistory",
    sort: { reviewedAt: -1, repertoireId: 1, variantName: 1, _id: 1 },
  },
  {
    fileName: "variantMistakes.json",
    collectionName: "variantMistakes",
    sort: { repertoireId: 1, variantName: 1, mistakeKey: 1, _id: 1 },
  },
  {
    fileName: "linkedGameAccounts.json",
    collectionName: "linkedGameAccounts",
    sort: { provider: 1, _id: 1 },
  },
  {
    fileName: "importedGames.json",
    collectionName: "importedGames",
    sort: { playedAt: -1, createdAt: -1, dedupeKey: 1, _id: 1 },
  },
  {
    fileName: "trainingPlans.json",
    collectionName: "trainingPlans",
    sort: { generatedAtDate: -1, id: 1, _id: 1 },
  },
] as const;

export async function getUserBackupFiles(userId: string): Promise<UserBackupFile[]> {
  const db = getDB();

  const users = await db.collection("users").find({ _id: new ObjectId(userId) }).toArray();

  const userFiles = await Promise.all(
    USER_COLLECTION_BACKUPS.map(async ({ fileName, collectionName, sort }) => {
      const documents = await db
        .collection(collectionName)
        .find({ userId })
        .sort(sort)
        .toArray();

      return {
        fileName,
        jsonValue: documents,
      };
    })
  );

  return [
    {
      fileName: USER_ACCOUNT_BACKUP_FILE_NAME,
      jsonValue: users,
    },
    ...userFiles,
  ];
}
