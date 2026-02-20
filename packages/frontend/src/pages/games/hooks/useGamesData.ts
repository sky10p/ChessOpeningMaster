import React from "react";
import { GamesStatsSummary, ImportedGame, LinkedGameAccount, TrainingPlan } from "@chess-opening-master/common";
import {
  clearImportedGames,
  deleteImportedGame,
  forceSynchronizeGames,
  getGamesStats,
  getImportedGames,
  getLinkedAccounts,
  getTrainingPlan,
  importGames,
  removeLinkedAccount,
  saveLinkedAccount,
  setTrainingPlanItemDone,
  ImportedGamesQuery,
} from "../../../repository/games/games";

export const useGamesData = (query: ImportedGamesQuery) => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const [accounts, setAccounts] = React.useState<LinkedGameAccount[]>([]);
  const [stats, setStats] = React.useState<GamesStatsSummary | null>(null);
  const [games, setGames] = React.useState<ImportedGame[]>([]);
  const [trainingPlan, setTrainingPlan] = React.useState<TrainingPlan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [provider, setProvider] = React.useState<"lichess" | "chesscom">("lichess");
  const [username, setUsername] = React.useState("");
  const [token, setToken] = React.useState("");
  const [manualPgn, setManualPgn] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [tournamentGroup, setTournamentGroup] = React.useState("");
  const [accountsLoaded, setAccountsLoaded] = React.useState(false);
  const accountsRequestIdRef = React.useRef(0);
  const gamesRequestIdRef = React.useRef(0);
  const statsRequestIdRef = React.useRef(0);
  const trainingPlanRequestIdRef = React.useRef(0);
  const startupSyncTriggeredRef = React.useRef(false);

  const isAccountDueForStartupSync = React.useCallback((account: LinkedGameAccount): boolean => {
    if (!account.lastSyncAt) {
      return true;
    }
    const lastSyncTime = new Date(account.lastSyncAt).getTime();
    if (Number.isNaN(lastSyncTime)) {
      return true;
    }
    return Date.now() - lastSyncTime > ONE_DAY_MS;
  }, [ONE_DAY_MS]);

  const loadAccounts = React.useCallback(async () => {
    const requestId = ++accountsRequestIdRef.current;
    const nextAccounts = await getLinkedAccounts();
    if (accountsRequestIdRef.current !== requestId) {
      return;
    }
    setAccounts(nextAccounts);
    setAccountsLoaded(true);
  }, []);

  const loadGames = React.useCallback(async () => {
    const requestId = ++gamesRequestIdRef.current;
    const nextGames = await getImportedGames({ limit: 500, ...query });
    if (gamesRequestIdRef.current !== requestId) {
      return;
    }
    setGames(nextGames);
  }, [query]);

  const loadStats = React.useCallback(async () => {
    const requestId = ++statsRequestIdRef.current;
    const nextStats = await getGamesStats(query);
    if (statsRequestIdRef.current !== requestId) {
      return;
    }
    setStats(nextStats);
  }, [query]);

  const loadTrainingPlan = React.useCallback(async () => {
    const requestId = ++trainingPlanRequestIdRef.current;
    const nextPlan = await getTrainingPlan(query);
    if (trainingPlanRequestIdRef.current !== requestId) {
      return;
    }
    setTrainingPlan(nextPlan);
  }, [query]);

  const refreshData = React.useCallback(async (options?: {
    accounts?: boolean;
    games?: boolean;
    stats?: boolean;
    trainingPlan?: boolean;
  }) => {
    const shouldLoadAccounts = options?.accounts ?? true;
    const shouldLoadGames = options?.games ?? true;
    const shouldLoadStats = options?.stats ?? true;
    const shouldLoadTrainingPlan = options?.trainingPlan ?? true;
    const tasks: Promise<void>[] = [];

    if (shouldLoadAccounts) {
      tasks.push(loadAccounts());
    }
    if (shouldLoadGames) {
      tasks.push(loadGames());
    }
    if (shouldLoadStats) {
      tasks.push(loadStats());
    }
    if (shouldLoadTrainingPlan) {
      tasks.push(loadTrainingPlan());
    }

    if (tasks.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(tasks);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load game insights");
    } finally {
      setLoading(false);
    }
  }, [loadAccounts, loadGames, loadStats, loadTrainingPlan]);

  const loadData = React.useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  React.useEffect(() => {
    void refreshData();
  }, [refreshData]);

  React.useEffect(() => {
    if (!accountsLoaded || startupSyncTriggeredRef.current) {
      return;
    }
    startupSyncTriggeredRef.current = true;
    const dueProviders = accounts
      .filter((account) => account.status !== "running")
      .filter(isAccountDueForStartupSync)
      .map((account) => account.provider);
    if (dueProviders.length === 0) {
      return;
    }

    const runStartupSync = async () => {
      setLoading(true);
      setMessage("Running automatic sync for due accounts...");
      try {
        for (const source of dueProviders) {
          await importGames({ source });
        }
        await forceSynchronizeGames({
          forceProviderSync: false,
          rematchGames: true,
          regeneratePlan: true,
          filters: query,
        });
        await refreshData({ accounts: true, games: true, stats: true, trainingPlan: true });
        setMessage(`Automatic sync complete for ${dueProviders.join(", ")}.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Automatic sync failed");
      } finally {
        setLoading(false);
      }
    };

    void runStartupSync();
  }, [accounts, accountsLoaded, isAccountDueForStartupSync, query, refreshData]);

  const connectAccount = React.useCallback(async () => {
    setMessage("");
    try {
      await saveLinkedAccount(provider, username, token || undefined);
      await refreshData({ accounts: true, games: false, stats: false, trainingPlan: false });
      setUsername("");
      setToken("");
      setMessage("Account linked");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to link account");
    }
  }, [provider, username, token, refreshData]);

  const syncProvider = React.useCallback(async (source: "lichess" | "chesscom") => {
    setMessage("");
    try {
      const summary = await importGames({ source });
      const recalc = await forceSynchronizeGames({
        forceProviderSync: false,
        rematchGames: true,
        regeneratePlan: true,
        filters: query,
      });
      await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
      setMessage(`Sync complete (${source}). Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}. Rematched ${recalc.rematch.updatedCount}/${recalc.rematch.scannedCount}; plan ${recalc.trainingPlan.itemCount} items.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync failed");
    }
  }, [query, refreshData]);

  const runManualImport = React.useCallback(async () => {
    setMessage("");
    try {
      const summary = await importGames({
        source: "manual",
        pgn: manualPgn,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        tournamentGroup: tournamentGroup || undefined,
      });
      const recalc = await forceSynchronizeGames({
        forceProviderSync: false,
        rematchGames: true,
        regeneratePlan: true,
        filters: query,
      });
      await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
      setMessage(`Manual import complete. Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}. Rematched ${recalc.rematch.updatedCount}/${recalc.rematch.scannedCount}; plan ${recalc.trainingPlan.itemCount} items.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Manual import failed");
    }
  }, [manualPgn, tags, tournamentGroup, query, refreshData]);

  const uploadPgnFile = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setManualPgn(await file.text());
  }, []);

  const regeneratePlan = React.useCallback(async () => {
    try {
      const summary = await forceSynchronizeGames({
        forceProviderSync: false,
        rematchGames: true,
        regeneratePlan: true,
        filters: query,
      });
      await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
      setMessage(`Training plan generated (${summary.trainingPlan.itemCount} items, ${summary.rematch.updatedCount}/${summary.rematch.scannedCount} games rematched).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate training plan");
    }
  }, [query, refreshData]);

  const markDone = React.useCallback(async (planId: string, lineKey: string, done: boolean) => {
    await setTrainingPlanItemDone(planId, lineKey, done);
    await refreshData({ accounts: false, games: false, stats: true, trainingPlan: true });
  }, [refreshData]);

  const forceSyncAll = React.useCallback(async () => {
    setMessage("");
    try {
      const summary = await forceSynchronizeGames({
        forceProviderSync: true,
        rematchGames: true,
        regeneratePlan: true,
        filters: query,
      });
      await refreshData({ accounts: true, games: true, stats: true, trainingPlan: true });
      const syncedProviders = summary.providerSync.attempted.length > 0 ? summary.providerSync.attempted.join(", ") : "none";
      setMessage(`Force sync complete. Providers: ${syncedProviders}. Rematched ${summary.rematch.updatedCount}/${summary.rematch.scannedCount}. Plan items: ${summary.trainingPlan.itemCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Force sync failed");
    }
  }, [query, refreshData]);

  const clearFiltered = React.useCallback(async () => {
    const confirmed = window.confirm("Delete all games in current filter?");
    if (!confirmed) {
      return;
    }
    const deletedCount = await clearImportedGames(query);
    await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
    setMessage(`Deleted ${deletedCount} filtered games.`);
  }, [query, refreshData]);

  const clearAll = React.useCallback(async () => {
    const confirmed = window.confirm("Delete ALL imported games and restart sync?");
    if (!confirmed) {
      return;
    }
    const deletedCount = await clearImportedGames();
    await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
    setMessage(`Deleted ${deletedCount} games.`);
  }, [refreshData]);

  const disconnectAccount = React.useCallback(async (source: "lichess" | "chesscom") => {
    await removeLinkedAccount(source);
    await refreshData({ accounts: true, games: false, stats: false, trainingPlan: false });
  }, [refreshData]);

  const removeGame = React.useCallback(async (gameId: string) => {
    await deleteImportedGame(gameId);
    await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
  }, [refreshData]);

  return {
    accounts,
    stats,
    games,
    trainingPlan,
    loading,
    message,
    provider,
    username,
    token,
    manualPgn,
    tags,
    tournamentGroup,
    setMessage,
    setProvider,
    setUsername,
    setToken,
    setManualPgn,
    setTags,
    setTournamentGroup,
    loadData,
    connectAccount,
    syncProvider,
    runManualImport,
    uploadPgnFile,
    regeneratePlan,
    forceSyncAll,
    markDone,
    clearFiltered,
    clearAll,
    disconnectAccount,
    removeGame,
  };
};
