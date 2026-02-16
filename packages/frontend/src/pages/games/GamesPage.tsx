import React from "react";
import {
  generateTrainingPlan,
  getGamesStats,
  getImportedGames,
  getLinkedAccounts,
  getTrainingPlan,
  importGames,
  removeLinkedAccount,
  saveLinkedAccount,
  setTrainingPlanItemDone,
} from "../../repository/games/games";
import { LinkedGameAccount, TrainingPlan } from "@chess-opening-master/common";

const providerOptions: Array<{ value: "lichess" | "chesscom"; label: string }> = [
  { value: "lichess", label: "Lichess" },
  { value: "chesscom", label: "Chess.com" },
];

const GamesPage: React.FC = () => {
  const [accounts, setAccounts] = React.useState<LinkedGameAccount[]>([]);
  const [gamesCount, setGamesCount] = React.useState(0);
  const [statsSummary, setStatsSummary] = React.useState<string>("");
  const [trainingPlan, setTrainingPlan] = React.useState<TrainingPlan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");
  const [provider, setProvider] = React.useState<"lichess" | "chesscom">("lichess");
  const [username, setUsername] = React.useState("");
  const [token, setToken] = React.useState("");
  const [manualPgn, setManualPgn] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [tournamentGroup, setTournamentGroup] = React.useState("");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [nextAccounts, nextGames, nextStats, nextPlan] = await Promise.all([
        getLinkedAccounts(),
        getImportedGames(),
        getGamesStats(),
        getTrainingPlan(),
      ]);
      setAccounts(nextAccounts);
      setGamesCount(nextGames.length);
      setStatsSummary(`W:${nextStats.wins} D:${nextStats.draws} L:${nextStats.losses} · WinRate ${(nextStats.winRate * 100).toFixed(1)}%`);
      setTrainingPlan(nextPlan);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load game insights");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      await loadData();
      if (ignore) {
        return;
      }
    })();
    return () => {
      ignore = true;
    };
  }, [loadData]);

  const connectAccount = async () => {
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
  };

  const syncProvider = async (source: "lichess" | "chesscom") => {
    setMessage("");
    try {
      const summary = await importGames({ source });
      await loadData();
      setMessage(`Sync complete. Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync failed");
    }
  };

  const runManualImport = async () => {
    setMessage("");
    try {
      const summary = await importGames({
        source: "manual",
        pgn: manualPgn,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        tournamentGroup: tournamentGroup || undefined,
      });
      await loadData();
      setMessage(`Manual import complete. Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Manual import failed");
    }
  };

  const uploadPgnFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    setManualPgn(text);
  };

  const regeneratePlan = async () => {
    try {
      const plan = await generateTrainingPlan();
      setTrainingPlan(plan);
      setMessage("Training plan generated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate training plan");
    }
  };

  const markDone = async (planId: string, lineKey: string, done: boolean) => {
    await setTrainingPlanItemDone(planId, lineKey, done);
    await loadData();
  };

  return (
    <div className="p-4 sm:p-6 text-gray-100 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Games Insights</h1>
        <button className="px-3 py-2 bg-blue-600 rounded" onClick={regeneratePlan}>Regenerate Training Plan</button>
      </div>
      {loading ? <p>Loading...</p> : null}
      {message ? <div className="bg-slate-800 border border-slate-600 rounded p-3 text-sm">{message}</div> : null}

      <section className="bg-slate-900 rounded border border-slate-700 p-4 space-y-3">
        <h2 className="text-xl font-semibold">Linked Accounts</h2>
        <div className="grid sm:grid-cols-4 gap-2">
          <select value={provider} onChange={(event) => setProvider(event.target.value as "lichess" | "chesscom")} className="bg-slate-800 p-2 rounded">
            {providerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input value={username} onChange={(event) => setUsername(event.target.value)} className="bg-slate-800 p-2 rounded" placeholder="Username" />
          <input value={token} onChange={(event) => setToken(event.target.value)} className="bg-slate-800 p-2 rounded" placeholder="Optional token" />
          <button className="bg-emerald-600 rounded p-2" onClick={connectAccount}>Connect</button>
        </div>
        <div className="space-y-2">
          {accounts.map((account) => (
            <div key={account.id} className="flex flex-wrap gap-2 items-center bg-slate-800 rounded p-2">
              <span className="font-medium">{account.provider} · {account.username}</span>
              <span className="text-xs text-gray-300">Status: {account.status}</span>
              <button className="bg-blue-600 rounded px-2 py-1 text-sm" onClick={() => syncProvider(account.provider)}>Sync</button>
              <button className="bg-red-700 rounded px-2 py-1 text-sm" onClick={async () => { await removeLinkedAccount(account.provider); await loadData(); }}>Disconnect</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 rounded border border-slate-700 p-4 space-y-3">
        <h2 className="text-xl font-semibold">Manual PGN Import</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <input value={tournamentGroup} onChange={(event) => setTournamentGroup(event.target.value)} className="bg-slate-800 p-2 rounded" placeholder="Tournament or training group (optional)" />
          <input value={tags} onChange={(event) => setTags(event.target.value)} className="bg-slate-800 p-2 rounded" placeholder="Tags (comma-separated)" />
        </div>
        <textarea value={manualPgn} onChange={(event) => setManualPgn(event.target.value)} className="w-full min-h-[180px] bg-slate-800 p-2 rounded" placeholder="Paste single or multi-game PGN" />
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".pgn" onChange={uploadPgnFile} className="text-sm" />
          <button className="bg-indigo-600 rounded px-3 py-2" onClick={runManualImport}>Import PGN</button>
        </div>
      </section>

      <section className="bg-slate-900 rounded border border-slate-700 p-4 space-y-2">
        <h2 className="text-xl font-semibold">Statistics</h2>
        <p>Total imported games: {gamesCount}</p>
        <p>{statsSummary}</p>
      </section>

      <section className="bg-slate-900 rounded border border-slate-700 p-4 space-y-3">
        <h2 className="text-xl font-semibold">Training Plan</h2>
        {!trainingPlan ? <p>No training plan yet.</p> : (
          <div className="space-y-2">
            {trainingPlan.items.map((item, index) => (
              <div key={item.lineKey} className="bg-slate-800 rounded p-3">
                <div className="flex justify-between gap-2">
                  <p className="font-medium">#{index + 1} {item.openingName}</p>
                  <label className="text-sm flex items-center gap-1">
                    <input type="checkbox" checked={item.done} onChange={(event) => { void markDone(trainingPlan.id, item.lineKey, event.target.checked); }} />
                    Done
                  </label>
                </div>
                <p className="text-xs text-gray-300">Priority {item.priority.toFixed(2)} · {item.effort}</p>
                <p className="text-sm">{item.movesSan.join(" ")}</p>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {item.tasks.map((task) => <li key={task}>{task}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GamesPage;
