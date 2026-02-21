import { runAutoSyncForDueAccounts } from "../games/gameImportService";
import {
  startGamesAutoSyncScheduler,
  stopGamesAutoSyncScheduler,
} from "../games/autoSyncScheduler";

jest.mock("../games/gameImportService", () => ({
  runAutoSyncForDueAccounts: jest.fn(),
}));

const mockedRunAutoSyncForDueAccounts = runAutoSyncForDueAccounts as jest.MockedFunction<
  typeof runAutoSyncForDueAccounts
>;

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const createDeferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe("autoSyncScheduler", () => {
  const originalEnable = process.env.ENABLE_GAMES_AUTO_SYNC;
  const originalInterval = process.env.GAMES_AUTO_SYNC_INTERVAL_MS;
  const originalBatchSize = process.env.GAMES_AUTO_SYNC_BATCH_SIZE;
  const originalShutdownTimeout = process.env.GAMES_AUTO_SYNC_SHUTDOWN_TIMEOUT_MS;

  beforeEach(() => {
    jest.useFakeTimers();
    mockedRunAutoSyncForDueAccounts.mockReset();
    process.env.ENABLE_GAMES_AUTO_SYNC = "true";
    process.env.GAMES_AUTO_SYNC_INTERVAL_MS = "60000";
    process.env.GAMES_AUTO_SYNC_BATCH_SIZE = "25";
    process.env.GAMES_AUTO_SYNC_SHUTDOWN_TIMEOUT_MS = "50";
  });

  afterEach(async () => {
    jest.advanceTimersByTime(1000);
    await stopGamesAutoSyncScheduler();
    jest.useRealTimers();
    process.env.ENABLE_GAMES_AUTO_SYNC = originalEnable;
    process.env.GAMES_AUTO_SYNC_INTERVAL_MS = originalInterval;
    process.env.GAMES_AUTO_SYNC_BATCH_SIZE = originalBatchSize;
    process.env.GAMES_AUTO_SYNC_SHUTDOWN_TIMEOUT_MS = originalShutdownTimeout;
  });

  it("runs immediately, prevents overlap, and waits for in-flight sync on stop", async () => {
    const deferred = createDeferred();
    mockedRunAutoSyncForDueAccounts.mockReturnValueOnce(deferred.promise);

    const scheduler = startGamesAutoSyncScheduler();
    await flushPromises();

    expect(mockedRunAutoSyncForDueAccounts).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(120000);
    await flushPromises();

    expect(mockedRunAutoSyncForDueAccounts).toHaveBeenCalledTimes(1);

    const stopPromise = scheduler.stop();
    let settled = false;
    stopPromise.then(() => {
      settled = true;
    });

    await flushPromises();
    expect(settled).toBe(false);

    deferred.resolve();
    await flushPromises();

    const completed = await stopPromise;
    expect(completed).toBe(true);

    jest.advanceTimersByTime(120000);
    await flushPromises();

    expect(mockedRunAutoSyncForDueAccounts).toHaveBeenCalledTimes(1);
  });

  it("returns false when shutdown timeout is reached", async () => {
    process.env.GAMES_AUTO_SYNC_SHUTDOWN_TIMEOUT_MS = "10";
    mockedRunAutoSyncForDueAccounts.mockReturnValue(new Promise<void>(() => undefined));

    const scheduler = startGamesAutoSyncScheduler();
    await flushPromises();

    const stopPromise = scheduler.stop();
    jest.advanceTimersByTime(11);

    const completed = await stopPromise;
    expect(completed).toBe(false);
  });

  it("does not start when auto-sync is disabled", async () => {
    process.env.ENABLE_GAMES_AUTO_SYNC = "false";

    const scheduler = startGamesAutoSyncScheduler();
    const completed = await scheduler.stop();

    expect(completed).toBe(true);
    expect(mockedRunAutoSyncForDueAccounts).not.toHaveBeenCalled();
  });

  it("is idempotent when started multiple times", async () => {
    mockedRunAutoSyncForDueAccounts.mockResolvedValue(undefined);

    const schedulerA = startGamesAutoSyncScheduler();
    const schedulerB = startGamesAutoSyncScheduler();
    await flushPromises();

    expect(mockedRunAutoSyncForDueAccounts).toHaveBeenCalledTimes(1);

    const completedA = await schedulerA.stop();
    const completedB = await schedulerB.stop();

    expect(completedA).toBe(true);
    expect(completedB).toBe(true);
  });
});
