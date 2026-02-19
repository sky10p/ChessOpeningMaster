import { ObjectId } from "mongodb";
import { LinkedGameAccount } from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { LinkedGameAccountDocument } from "../../models/GameImport";
import { encryptSecret } from "./security";

const mapAccount = (doc: LinkedGameAccountDocument & { _id: ObjectId }): LinkedGameAccount => ({
  id: doc._id.toString(),
  provider: doc.provider,
  username: doc.username,
  connectedAt: doc.connectedAt.toISOString(),
  lastSyncAt: doc.lastSyncAt?.toISOString(),
  status: doc.status,
  lastError: doc.lastError,
  lastSyncStartedAt: doc.lastSyncStartedAt?.toISOString(),
  lastSyncFinishedAt: doc.lastSyncFinishedAt?.toISOString(),
  lastSyncFeedback: doc.lastSyncFeedback,
});

export async function listLinkedAccountsForUser(userId: string): Promise<LinkedGameAccount[]> {
  const db = getDB();
  const accounts = await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").find({ userId }).toArray();
  return accounts.map((doc) => mapAccount({ ...doc, _id: doc._id as unknown as ObjectId }));
}

export async function upsertLinkedAccountForUser(
  userId: string,
  provider: "lichess" | "chesscom",
  username: string,
  token?: string
): Promise<LinkedGameAccount> {
  const db = getDB();
  const now = new Date();
  await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").updateOne(
    { userId, provider },
    {
      $set: {
        userId,
        provider,
        username,
        status: "idle",
        ...(token ? { tokenEncrypted: encryptSecret(token) } : {}),
      },
      $setOnInsert: { connectedAt: now },
    },
    { upsert: true }
  );
  const account = await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").findOne({ userId, provider });
  return mapAccount({ ...(account as LinkedGameAccountDocument), _id: account?._id as unknown as ObjectId });
}

export async function disconnectLinkedAccountForUser(userId: string, provider: "lichess" | "chesscom"): Promise<void> {
  const db = getDB();
  await db.collection("linkedGameAccounts").deleteOne({ userId, provider });
}
