import React from "react";
import { GamesStatsSummary, ImportedGame, LinkedGameAccount, TrainingPlan } from "@chess-opening-master/common";
import {
  clearImportedGames,
  deleteImportedGame,
  generateTrainingPlan,
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
  const accountsRequestIdRef = React.useRef(0);
  const gamesRequestIdRef = React.useRef(0);
  const statsRequestIdRef = React.useRef(0);
  const trainingPlanRequestIdRef = React.useRef(0);

  const loadAccounts = React.useCallback(async () => {
    const requestId = ++accountsRequestIdRef.current;
    const nextAccounts = await getLinkedAccounts();
    if (accountsRequestIdRef.current !== requestId) {
      return;
    }
    setAccounts(nextAccounts);
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
      await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
      setMessage(`Sync complete (${source}). Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync failed");
    }
  }, [refreshData]);

  const runManualImport = React.useCallback(async () => {
    setMessage("");
    try {
      const summary = await importGames({
        source: "manual",
        pgn: manualPgn,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        tournamentGroup: tournamentGroup || undefined,
      });
      await refreshData({ accounts: false, games: true, stats: true, trainingPlan: true });
      setMessage(`Manual import complete. Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Manual import failed");
    }
  }, [manualPgn, tags, tournamentGroup, refreshData]);

  const uploadPgnFile = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setManualPgn(await file.text());
  }, []);

  const regeneratePlan = React.useCallback(async () => {
    try {
      setTrainingPlan(await generateTrainingPlan(undefined, query));
      setMessage("Training plan generated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate training plan");
    }
  }, [query]);

  const markDone = React.useCallback(async (planId: string, lineKey: string, done: boolean) => {
    await setTrainingPlanItemDone(planId, lineKey, done);
    await refreshData({ accounts: false, games: false, stats: false, trainingPlan: true });
  }, [refreshData]);

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
    markDone,
    clearFiltered,
    clearAll,
    disconnectAccount,
    removeGame,
  };
};
