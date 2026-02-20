import { runAutoSyncForDueAccounts } from "./gameImportService";
import { logError } from "../../utils/logger";

const getAutoSyncIntervalMs = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_INTERVAL_MS || 24 * 60 * 60 * 1000);
  if (!Number.isFinite(value) || value < 60 * 1000) {
    return 24 * 60 * 60 * 1000;
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

const getAutoSyncShutdownTimeoutMs = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_SHUTDOWN_TIMEOUT_MS || 30 * 1000);
  if (!Number.isFinite(value) || value <= 0) {
    return 30 * 1000;
  }
  return value;
};

type SchedulerState = {
  intervalId: ReturnType<typeof setInterval>;
  running: boolean;
  currentRun: Promise<void> | null;
  stopping: boolean;
  stopPromise: Promise<boolean> | null;
};

export type GamesAutoSyncSchedulerHandle = {
  stop: () => Promise<boolean>;
};

const waitForPromise = async (target: Promise<void>, timeoutMs: number): Promise<boolean> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<false>((resolve) => {
    timeoutId = setTimeout(() => resolve(false), timeoutMs);
  });
  const completed = await Promise.race([target.then(() => true), timeoutPromise]);
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  return completed;
};

let schedulerState: SchedulerState | null = null;

export function startGamesAutoSyncScheduler(): GamesAutoSyncSchedulerHandle {
  if (process.env.ENABLE_GAMES_AUTO_SYNC === "false") {
    return {
      stop: async () => true,
    };
  }

  if (schedulerState && !schedulerState.stopping) {
    return {
      stop: stopGamesAutoSyncScheduler,
    };
  }

  const run = async () => {
    if (!schedulerState || schedulerState.running || schedulerState.stopping) {
      return;
    }
    schedulerState.running = true;
    const currentRun = (async () => {
      try {
        await runAutoSyncForDueAccounts(getAutoSyncBatchSize());
      } catch (error) {
        logError("Games auto-sync cycle failed", error);
      } finally {
        if (schedulerState) {
          schedulerState.running = false;
          schedulerState.currentRun = null;
        }
      }
    })();
    schedulerState.currentRun = currentRun;
    try {
      await currentRun;
    } catch {
      return;
    }
  };

  const intervalId = setInterval(() => {
    void run();
  }, getAutoSyncIntervalMs());

  schedulerState = {
    intervalId,
    running: false,
    currentRun: null,
    stopping: false,
    stopPromise: null,
  };

  void run();

  return {
    stop: stopGamesAutoSyncScheduler,
  };
}

export async function stopGamesAutoSyncScheduler(): Promise<boolean> {
  const currentState = schedulerState;
  if (!currentState) {
    return true;
  }
  if (currentState.stopPromise) {
    return currentState.stopPromise;
  }

  currentState.stopping = true;
  clearInterval(currentState.intervalId);

  const activeRun = currentState.currentRun;
  const stopPromise = (async () => {
    if (!activeRun) {
      schedulerState = null;
      return true;
    }
    const completed = await waitForPromise(activeRun, getAutoSyncShutdownTimeoutMs());
    schedulerState = null;
    return completed;
  })();

  currentState.stopPromise = stopPromise;
  return stopPromise;
}
