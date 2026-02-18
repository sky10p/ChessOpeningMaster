import { runAutoSyncForDueAccounts } from "./gameImportService";

const getAutoSyncIntervalMs = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_INTERVAL_MS || 60 * 60 * 1000);
  if (!Number.isFinite(value) || value < 60 * 1000) {
    return 60 * 60 * 1000;
  }
  return value;
};

const getAutoSyncBatchSize = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_BATCH_SIZE || 25);
  if (!Number.isFinite(value) || value <= 0) {
    return 25;
  }
  return value;
};

export function startGamesAutoSyncScheduler(): void {
  if (process.env.ENABLE_GAMES_AUTO_SYNC === "false") {
    return;
  }

  let running = false;
  const run = async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      await runAutoSyncForDueAccounts(getAutoSyncBatchSize());
    } catch (error) {
      console.error("Games auto-sync cycle failed", error);
    } finally {
      running = false;
    }
  };

  void run();
  setInterval(() => {
    void run();
  }, getAutoSyncIntervalMs());
}
