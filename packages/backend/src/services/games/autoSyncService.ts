import { getDB } from "../../db/mongo";
import { LinkedGameAccountDocument } from "../../models/GameImport";
import { ProviderImportInput } from "./gameImportOrchestratorService";

const getAutoSyncDueHours = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_DUE_HOURS || 24);
  if (!Number.isFinite(value) || value <= 0) {
    return 24;
  }
  return value;
};

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
      console.error("Auto-sync failed", {
        userId: account.userId,
        provider: account.provider,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
