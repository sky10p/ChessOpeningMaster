import { getDB } from "../../db/mongo";
import { LinkedGameAccountDocument } from "../../models/GameImport";
import { ProviderImportInput } from "./gameImportOrchestratorService";
import { logError } from "../../utils/logger";
import { getAutoSyncDueHours } from "./autoSyncConfig";

export async function runAutoSyncForDueAccountsInternal(
  importGamesForUser: (userId: string, input: ProviderImportInput) => Promise<unknown>,
  maxAccounts = 25
): Promise<void> {
  const db = getDB();
  const dueBefore = new Date(Date.now() - getAutoSyncDueHours() * 60 * 60 * 1000);
  const dueAccounts = await db.collection<LinkedGameAccountDocument>("linkedGameAccounts")
    .find({
      provider: { $in: ["lichess", "chesscom"] },
      status: { $ne: "running" },
      $or: [
        { lastSyncAt: { $exists: false } },
        { lastSyncAt: { $lte: dueBefore } },
      ],
    })
    .limit(maxAccounts)
    .toArray();

  for (const account of dueAccounts) {
    try {
      await importGamesForUser(account.userId, { source: account.provider });
    } catch (error) {
      logError("Auto-sync failed", error, {
        userId: account.userId,
        provider: account.provider,
      });
    }
  }
}
