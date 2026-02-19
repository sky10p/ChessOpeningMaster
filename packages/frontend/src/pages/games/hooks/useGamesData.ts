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
  const requestIdRef = React.useRef(0);

  const loadData = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const [nextAccounts, nextGames, nextStats, nextPlan] = await Promise.all([
        getLinkedAccounts(),
        getImportedGames({ limit: 500, ...query }),
        getGamesStats(query),
        getTrainingPlan(query),
      ]);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setAccounts(nextAccounts);
      setGames(nextGames);
      setStats(nextStats);
      setTrainingPlan(nextPlan);
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setMessage(error instanceof Error ? error.message : "Failed to load game insights");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [query]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const connectAccount = React.useCallback(async () => {
    setMessage("");
    try {
      await saveLinkedAccount(provider, username, token || undefined);
      await loadData();
      setUsername("");
      setToken("");
      setMessage("Account linked");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to link account");
    }
  }, [provider, username, token, loadData]);

  const syncProvider = React.useCallback(async (source: "lichess" | "chesscom") => {
    setMessage("");
    try {
      const summary = await importGames({ source });
      await loadData();
      setMessage(`Sync complete (${source}). Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync failed");
    }
  }, [loadData]);

  const runManualImport = React.useCallback(async () => {
    setMessage("");
    try {
      const summary = await importGames({
        source: "manual",
        pgn: manualPgn,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        tournamentGroup: tournamentGroup || undefined,
      });
      await loadData();
      setMessage(`Manual import complete. Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Manual import failed");
    }
  }, [loadData, manualPgn, tags, tournamentGroup]);

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
    await loadData();
  }, [loadData]);

  const clearFiltered = React.useCallback(async () => {
    const confirmed = window.confirm("Delete all games in current filter?");
    if (!confirmed) {
      return;
    }
    const deletedCount = await clearImportedGames(query);
    await loadData();
    setMessage(`Deleted ${deletedCount} filtered games.`);
  }, [loadData, query]);

  const clearAll = React.useCallback(async () => {
    const confirmed = window.confirm("Delete ALL imported games and restart sync?");
    if (!confirmed) {
      return;
    }
    const deletedCount = await clearImportedGames();
    await loadData();
    setMessage(`Deleted ${deletedCount} games.`);
  }, [loadData]);

  const disconnectAccount = React.useCallback(async (source: "lichess" | "chesscom") => {
    await removeLinkedAccount(source);
    await loadData();
  }, [loadData]);

  const removeGame = React.useCallback(async (gameId: string) => {
    await deleteImportedGame(gameId);
    await loadData();
  }, [loadData]);

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
