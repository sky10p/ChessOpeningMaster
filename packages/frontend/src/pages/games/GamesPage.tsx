import React from "react";
import { useNavigate } from "react-router-dom";
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
} from "../../repository/games/games";
import { GamesStatsSummary, ImportedGame, LinkedGameAccount, TrainingPlan } from "@chess-opening-master/common";

type GamesTab = "insights" | "training" | "sync" | "data";

type GlobalFilterState = {
  source: "all" | "lichess" | "chesscom" | "manual";
  color: "all" | "white" | "black";
  mapped: "all" | "mapped" | "unmapped";
  timeControlBucket: "all" | "bullet" | "blitz" | "rapid" | "classical";
  openingQuery: string;
  dateFrom: string;
  dateTo: string;
};

const providerOptions: Array<{ value: "lichess" | "chesscom"; label: string }> = [
  { value: "lichess", label: "Lichess" },
  { value: "chesscom", label: "Chess.com" },
];

const tabs: Array<{ id: GamesTab; label: string }> = [
  { id: "insights", label: "Insights" },
  { id: "training", label: "Training" },
  { id: "sync", label: "Sync" },
  { id: "data", label: "Data" },
];

const defaultFilters: GlobalFilterState = {
  source: "all",
  color: "all",
  mapped: "all",
  timeControlBucket: "all",
  openingQuery: "",
  dateFrom: "",
  dateTo: "",
};

const formatDateTime = (value?: string): string => (value ? new Date(value).toLocaleString() : "n/a");
const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`;

const normalizeLabel = (value?: string): string => (value || "").trim().toLowerCase();

const isUnknownLabel = (value: string): boolean => normalizeLabel(value) === "unknown";

const getOpeningLabel = (game: ImportedGame): string => (
  game.openingDetection.openingName
  || game.openingMapping.variantName
  || game.openingMapping.repertoireName
  || (game.openingDetection.eco ? `ECO ${game.openingDetection.eco}` : "Unknown")
);

const buildLineTitle = (openingName: string, variantName?: string, repertoireName?: string): string => {
  const pieces = [openingName];
  const normalizedOpening = normalizeLabel(openingName);
  const normalizedVariant = normalizeLabel(variantName);
  const normalizedRepertoire = normalizeLabel(repertoireName);
  if (variantName && normalizedVariant && normalizedVariant !== normalizedOpening) {
    pieces.push(variantName);
  }
  if (repertoireName && normalizedRepertoire && normalizedRepertoire !== normalizedOpening && normalizedRepertoire !== normalizedVariant) {
    pieces.push(repertoireName);
  }
  return pieces.join(" | ");
};

const outcomePercentages = (wins: number, draws: number, losses: number): { win: number; draw: number; loss: number } => {
  const total = wins + draws + losses;
  if (total <= 0) {
    return { win: 0, draw: 0, loss: 0 };
  }
  return {
    win: wins / total,
    draw: draws / total,
    loss: losses / total,
  };
};

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = React.useState<LinkedGameAccount[]>([]);
  const [stats, setStats] = React.useState<GamesStatsSummary | null>(null);
  const [games, setGames] = React.useState<ImportedGame[]>([]);
  const [trainingPlan, setTrainingPlan] = React.useState<TrainingPlan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");
  const [provider, setProvider] = React.useState<"lichess" | "chesscom">("lichess");
  const [username, setUsername] = React.useState("");
  const [token, setToken] = React.useState("");
  const [manualPgn, setManualPgn] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [tournamentGroup, setTournamentGroup] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<GamesTab>("insights");
  const [filtersDraft, setFiltersDraft] = React.useState<GlobalFilterState>(defaultFilters);
  const [filtersApplied, setFiltersApplied] = React.useState<GlobalFilterState>(defaultFilters);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const openRepertoire = React.useCallback((repertoireId: string, variantName?: string) => {
    const variantQuery = variantName ? `?variantName=${encodeURIComponent(variantName)}` : "";
    navigate(`/repertoire/${repertoireId}${variantQuery}`);
  }, [navigate]);

  const openTrainRepertoire = React.useCallback((repertoireId: string, variantName?: string) => {
    const variantQuery = variantName ? `?variantName=${encodeURIComponent(variantName)}` : "";
    navigate(`/repertoire/train/${repertoireId}${variantQuery}`);
  }, [navigate]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const importedQuery = {
        limit: 500,
        source: filtersApplied.source === "all" ? undefined : filtersApplied.source,
        color: filtersApplied.color === "all" ? undefined : filtersApplied.color,
        mapped: filtersApplied.mapped,
        openingQuery: filtersApplied.openingQuery.trim() || undefined,
        dateFrom: filtersApplied.dateFrom || undefined,
        dateTo: filtersApplied.dateTo || undefined,
        timeControlBucket: filtersApplied.timeControlBucket === "all" ? undefined : filtersApplied.timeControlBucket,
      };
      const statsQuery = {
        source: importedQuery.source,
        color: importedQuery.color,
        mapped: importedQuery.mapped,
        openingQuery: importedQuery.openingQuery,
        dateFrom: importedQuery.dateFrom,
        dateTo: importedQuery.dateTo,
        timeControlBucket: importedQuery.timeControlBucket,
      };
      const [nextAccounts, nextGames, nextStats, nextPlan] = await Promise.all([
        getLinkedAccounts(),
        getImportedGames(importedQuery),
        getGamesStats(statsQuery),
        getTrainingPlan(),
      ]);
      setAccounts(nextAccounts);
      setGames(nextGames);
      setStats(nextStats);
      setTrainingPlan(nextPlan);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load game insights");
    } finally {
      setLoading(false);
    }
  }, [filtersApplied]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const openingTargetFromLine = React.useCallback((lineKey: string) => {
    const game = games.find((item) => item.openingDetection.lineKey === lineKey && item.openingMapping.repertoireId);
    if (!game?.openingMapping.repertoireId) {
      return null;
    }
    return {
      repertoireId: game.openingMapping.repertoireId,
      variantName: game.openingMapping.variantName || game.openingDetection.openingName || getOpeningLabel(game),
    };
  }, [games]);

  const mappedRatio = stats && stats.totalGames > 0 ? stats.mappedToRepertoireCount / stats.totalGames : 0;
  const manualReviewRatio = stats && stats.totalGames > 0 ? stats.needsManualReviewCount / stats.totalGames : 0;
  const wdl = outcomePercentages(stats?.wins || 0, stats?.draws || 0, stats?.losses || 0);

  const variantPerformance = React.useMemo(() => (stats?.variantPerformance || []).filter((item) => item.games >= 2), [stats]);

  const weakestVariants = React.useMemo(() => [...variantPerformance]
    .sort((a, b) => a.successRate - b.successRate || b.games - a.games)
    .slice(0, 4), [variantPerformance]);

  const strongestVariants = React.useMemo(() => [...variantPerformance]
    .sort((a, b) => b.successRate - a.successRate || b.games - a.games)
    .slice(0, 4), [variantPerformance]);

  const focusLines = React.useMemo(() => stats?.linesToStudy || [], [stats]);
  const focusLineKeySet = React.useMemo(() => new Set(focusLines.map((line) => line.lineKey)), [focusLines]);

  const actionableTrainingItems = React.useMemo(() => (trainingPlan?.items || [])
    .filter((item) => focusLineKeySet.size === 0 || focusLineKeySet.has(item.lineKey))
    .filter((item) => item.mappedGames > 0 && Boolean(item.variantName || item.repertoireName))
    .sort((a, b) => ((b.trainingErrors || 0) - (a.trainingErrors || 0)) || (b.priority - a.priority))
  , [trainingPlan, focusLineKeySet]);

  const signalLines = React.useMemo(() => [...focusLines]
    .sort((a, b) => ((b.trainingErrors || 0) - (a.trainingErrors || 0)) || (b.deviationRate - a.deviationRate))
  , [focusLines]);
  const trainingItemsWithErrors = actionableTrainingItems.filter((item) => (item.trainingErrors || 0) > 0).length;
  const highPriorityTrainingItems = actionableTrainingItems.filter((item) => item.priority >= 0.7).length;
  const offBookSignalCount = signalLines.filter((line) => line.mappedGames === 0 || line.manualReviewGames > 0).length;

  const offBookOpenings = React.useMemo(() => (stats?.unmappedOpenings || [])
    .filter((opening) => opening.mappedGames === 0 || isUnknownLabel(opening.openingName))
    .slice(0, 8), [stats]);

  const gamesByMonth = stats?.gamesByMonth || [];
  const maxMonthGames = gamesByMonth.reduce((max, month) => Math.max(max, month.games), 0);

  const gamesByMonthGroups = React.useMemo(() => {
    const groups = new Map<string, ImportedGame[]>();
    games.forEach((game) => {
      const key = game.playedAt ? new Date(game.playedAt).toISOString().slice(0, 7) : "Unknown";
      groups.set(key, [...(groups.get(key) || []), game]);
    });
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [games]);

  const trainingIdeas = React.useMemo(() => {
    const ideas: string[] = [];
    const topWeak = weakestVariants[0];
    if (topWeak) {
      ideas.push(`Prioritize ${topWeak.variantName}: ${formatPercent(topWeak.successRate)} success in ${topWeak.games} games.`);
    }
    const offBook = offBookOpenings[0];
    if (offBook) {
      ideas.push(`Reduce off-book play in ${offBook.openingName}: ${offBook.manualReviewGames}/${offBook.games} games need manual review.`);
    }
    const unused = (stats?.unusedRepertoires || [])[0];
    if (unused) {
      ideas.push(`You have no mapped games in repertoire "${unused.repertoireName}". Add focused games for that side.`);
    }
    const topSource = [...(stats?.bySource || [])].sort((a, b) => b.count - a.count)[0];
    if (topSource) {
      ideas.push(`Most games come from ${topSource.source}. Keep this source synced daily.`);
    }
    return ideas;
  }, [weakestVariants, offBookOpenings, stats]);

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
      setMessage(`Sync complete (${source}). Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}.`);
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
      setMessage(`Manual import complete. Imported ${summary.importedCount}, duplicates ${summary.duplicateCount}, failed ${summary.failedCount}, processed ${summary.processedCount}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Manual import failed");
    }
  };

  const uploadPgnFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setManualPgn(await file.text());
  };

  const regeneratePlan = async () => {
    try {
      setTrainingPlan(await generateTrainingPlan());
      setMessage("Training plan generated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate training plan");
    }
  };

  const markDone = async (planId: string, lineKey: string, done: boolean) => {
    await setTrainingPlanItemDone(planId, lineKey, done);
    await loadData();
  };

  const clearFiltered = async () => {
    const confirmed = window.confirm("Delete all games in current filter?");
    if (!confirmed) {
      return;
    }
    const deletedCount = await clearImportedGames({
      source: filtersApplied.source === "all" ? undefined : filtersApplied.source,
      color: filtersApplied.color === "all" ? undefined : filtersApplied.color,
      mapped: filtersApplied.mapped,
      openingQuery: filtersApplied.openingQuery.trim() || undefined,
      dateFrom: filtersApplied.dateFrom || undefined,
      dateTo: filtersApplied.dateTo || undefined,
      timeControlBucket: filtersApplied.timeControlBucket === "all" ? undefined : filtersApplied.timeControlBucket,
    });
    await loadData();
    setMessage(`Deleted ${deletedCount} filtered games.`);
  };

  const clearAll = async () => {
    const confirmed = window.confirm("Delete ALL imported games and restart sync?");
    if (!confirmed) {
      return;
    }
    const deletedCount = await clearImportedGames();
    await loadData();
    setMessage(`Deleted ${deletedCount} games.`);
  };

  const applyFilters = () => {
    setFiltersApplied(filtersDraft);
  };

  const applyFiltersMobile = () => {
    setFiltersApplied(filtersDraft);
    setShowMobileFilters(false);
  };

  const resetFilters = () => {
    setFiltersDraft(defaultFilters);
    setFiltersApplied(defaultFilters);
    setShowMobileFilters(false);
  };

  const activeFiltersCount = [
    filtersApplied.source !== "all",
    filtersApplied.color !== "all",
    filtersApplied.mapped !== "all",
    filtersApplied.timeControlBucket !== "all",
    Boolean(filtersApplied.openingQuery.trim()),
    Boolean(filtersApplied.dateFrom),
    Boolean(filtersApplied.dateTo),
  ].filter(Boolean).length;

  return (
    <div className="w-full h-full min-h-0 self-stretch bg-gradient-to-b from-slate-950 via-slate-900 to-primary rounded-none sm:rounded-lg shadow-2xl flex flex-col overflow-hidden">
      <header className="p-3 sm:p-4 bg-primary/95 backdrop-blur border-b border-slate-800 sticky top-0 z-20">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">My Games Intelligence</h1>
            <p className="text-xs sm:text-sm text-slate-300">Clear performance by variant, focused training, and full data control.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button className="flex-1 sm:flex-none px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded" onClick={() => { void loadData(); }}>Refresh</button>
            <button className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-500 text-sm rounded" onClick={regeneratePlan}>Regenerate Plan</button>
          </div>
        </div>
        {loading ? <p className="text-xs text-slate-400 mt-2">Loading latest data...</p> : null}
        {message ? <div className="mt-3 bg-slate-900/80 border border-slate-700 rounded p-2 text-sm text-slate-200">{message}</div> : null}
      </header>

      <nav className="flex gap-2 p-3 bg-primary/90 border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} className={`flex-shrink-0 rounded-md px-3 py-2 text-left transition-colors ${selectedTab === tab.id ? "bg-blue-600 text-white shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`} onClick={() => setSelectedTab(tab.id)}>
            <p className="text-sm font-semibold">{tab.label}</p>
          </button>
        ))}
      </nav>

      {selectedTab !== "sync" ? (
        <section className="sm:hidden px-3 py-2 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <p className="text-xs text-slate-300">{activeFiltersCount > 0 ? `${activeFiltersCount} active filters` : "No active filters"}</p>
          <button className="px-3 py-1.5 rounded bg-slate-700 text-xs text-slate-100" onClick={() => setShowMobileFilters(true)}>Filters</button>
        </section>
      ) : null}

      {selectedTab !== "sync" ? (
        <section className="hidden sm:block p-3 border-b border-slate-800 bg-slate-900/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
            <select value={filtersDraft.source} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, source: event.target.value as GlobalFilterState["source"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
              <option value="all">All sources</option>
              <option value="lichess">Lichess</option>
              <option value="chesscom">Chess.com</option>
              <option value="manual">Manual PGN</option>
            </select>
            <select value={filtersDraft.color} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, color: event.target.value as GlobalFilterState["color"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
              <option value="all">All colors</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
            <select value={filtersDraft.timeControlBucket} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, timeControlBucket: event.target.value as GlobalFilterState["timeControlBucket"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
              <option value="all">All speeds</option>
              <option value="bullet">Bullet</option>
              <option value="blitz">Blitz</option>
              <option value="rapid">Rapid</option>
              <option value="classical">Classical</option>
            </select>
            <select value={filtersDraft.mapped} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, mapped: event.target.value as GlobalFilterState["mapped"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
              <option value="all">Mapped + unmapped</option>
              <option value="mapped">Mapped only</option>
              <option value="unmapped">Unmapped only</option>
            </select>
            <input type="date" value={filtersDraft.dateFrom} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateFrom: event.target.value }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700" />
            <input type="date" value={filtersDraft.dateTo} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateTo: event.target.value }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700" />
            <input value={filtersDraft.openingQuery} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, openingQuery: event.target.value }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700" placeholder="Opening or variant..." />
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded bg-blue-600 text-sm" onClick={applyFilters}>Apply</button>
              <button className="flex-1 px-3 py-2 rounded bg-slate-700 text-sm" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </section>
      ) : null}

      {selectedTab !== "sync" && showMobileFilters ? (
        <div className="sm:hidden fixed inset-0 z-40 bg-slate-950/80 flex items-end">
          <div className="w-full rounded-t-2xl border-t border-slate-700 bg-slate-900 p-3 space-y-3 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Filters</h3>
              <button className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-100" onClick={() => setShowMobileFilters(false)}>Close</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <select value={filtersDraft.source} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, source: event.target.value as GlobalFilterState["source"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
                <option value="all">All sources</option>
                <option value="lichess">Lichess</option>
                <option value="chesscom">Chess.com</option>
                <option value="manual">Manual PGN</option>
              </select>
              <select value={filtersDraft.color} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, color: event.target.value as GlobalFilterState["color"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
                <option value="all">All colors</option>
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
              <select value={filtersDraft.timeControlBucket} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, timeControlBucket: event.target.value as GlobalFilterState["timeControlBucket"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
                <option value="all">All speeds</option>
                <option value="bullet">Bullet</option>
                <option value="blitz">Blitz</option>
                <option value="rapid">Rapid</option>
                <option value="classical">Classical</option>
              </select>
              <select value={filtersDraft.mapped} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, mapped: event.target.value as GlobalFilterState["mapped"] }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700">
                <option value="all">Mapped + unmapped</option>
                <option value="mapped">Mapped only</option>
                <option value="unmapped">Unmapped only</option>
              </select>
              <input type="date" value={filtersDraft.dateFrom} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateFrom: event.target.value }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700" />
              <input type="date" value={filtersDraft.dateTo} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateTo: event.target.value }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700" />
              <input value={filtersDraft.openingQuery} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, openingQuery: event.target.value }))} className="bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700" placeholder="Opening or variant..." />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded bg-blue-600 text-sm" onClick={applyFiltersMobile}>Apply</button>
              <button className="flex-1 px-3 py-2 rounded bg-slate-700 text-sm" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-20 pt-3 sm:p-4 space-y-4 sm:space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>
        {selectedTab === "insights" ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Imported Games</p><p className="text-xl font-semibold text-slate-100">{stats?.totalGames || 0}</p></div>
              <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Win Rate</p><p className="text-xl font-semibold text-slate-100">{formatPercent(stats?.winRate || 0)}</p><p className="text-xs text-slate-400">W {stats?.wins || 0} D {stats?.draws || 0} L {stats?.losses || 0}</p></div>
              <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Mapped To Repertoire</p><p className="text-xl font-semibold text-slate-100">{formatPercent(mappedRatio)}</p></div>
              <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Off-Book Pressure</p><p className="text-xl font-semibold text-slate-100">{formatPercent(manualReviewRatio)}</p></div>
              <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Unique Lines</p><p className="text-xl font-semibold text-slate-100">{stats?.uniqueLines || 0}</p></div>
            </section>

            <section className="bg-slate-900 rounded-lg border border-slate-700 p-4 space-y-2">
              <h2 className="text-lg font-semibold text-slate-100">Overall Outcome Ratio</h2>
              <div className="h-3 bg-slate-700 rounded overflow-hidden flex">
                <div className="bg-emerald-500" style={{ width: `${(wdl.win * 100).toFixed(2)}%` }} />
                <div className="bg-slate-400" style={{ width: `${(wdl.draw * 100).toFixed(2)}%` }} />
                <div className="bg-rose-500" style={{ width: `${(wdl.loss * 100).toFixed(2)}%` }} />
              </div>
              <p className="text-xs text-slate-300">Win {formatPercent(wdl.win)} | Draw {formatPercent(wdl.draw)} | Loss {formatPercent(wdl.loss)}</p>
            </section>
          </>
        ) : null}

        {selectedTab === "insights" ? (
          <>
            <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
              <h2 className="text-lg font-semibold text-slate-100">Games By Date</h2>
              <p className="text-xs text-slate-400">Monthly game volume for the current filters.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-10 gap-2 items-end min-h-[120px] sm:min-h-[140px]">
                {gamesByMonth.map((month) => (
                  <div key={month.month} className="space-y-1">
                    <div className="h-24 bg-slate-800 rounded flex items-end">
                      <div className="w-full bg-blue-500 rounded" style={{ height: `${maxMonthGames > 0 ? Math.max(6, (month.games / maxMonthGames) * 100) : 6}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-300">{month.month}</p>
                    <p className="text-[11px] text-slate-400">{month.games}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
              <h2 className="text-lg font-semibold text-slate-100">Success / Draw / Loss By Opening Variant</h2>
              {(variantPerformance.length === 0) ? <p className="text-sm text-slate-400">No variant data for current filters.</p> : null}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {variantPerformance.slice(0, 8).map((variant) => {
                  const percentages = outcomePercentages(variant.wins, variant.draws, variant.losses);
                  return (
                    <div key={variant.variantKey} className="bg-slate-800/90 rounded p-2 sm:p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-100 truncate">{variant.variantName}</p>
                        <p className="text-xs sm:text-sm text-slate-200">{formatPercent(variant.successRate)}</p>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400">G {variant.games} | W {variant.wins} D {variant.draws} L {variant.losses}</p>
                      <div className="mt-1.5 h-1.5 bg-slate-700 rounded overflow-hidden flex">
                        <div className="bg-emerald-500" style={{ width: `${(percentages.win * 100).toFixed(2)}%` }} />
                        <div className="bg-slate-400" style={{ width: `${(percentages.draw * 100).toFixed(2)}%` }} />
                        <div className="bg-rose-500" style={{ width: `${(percentages.loss * 100).toFixed(2)}%` }} />
                      </div>
                      {variant.repertoireId ? (
                        <div className="mt-1.5 hidden sm:flex gap-2">
                          <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(variant.repertoireId as string, variant.variantName)}>See</button>
                          <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(variant.repertoireId as string, variant.variantName)}>Train</button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
                <h2 className="text-lg font-semibold text-slate-100">Weakest Variants</h2>
                {weakestVariants.map((variant) => (
                  <div key={`weak-${variant.variantKey}`} className="bg-slate-800/90 rounded p-3 flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-100">{variant.variantName}</p>
                    <p className="text-sm text-rose-300">{formatPercent(variant.successRate)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
                <h2 className="text-lg font-semibold text-slate-100">Strongest Variants</h2>
                {strongestVariants.map((variant) => (
                  <div key={`strong-${variant.variantKey}`} className="bg-slate-800/90 rounded p-3 flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-100">{variant.variantName}</p>
                    <p className="text-sm text-emerald-300">{formatPercent(variant.successRate)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
                <h2 className="text-lg font-semibold text-slate-100">Off-Book And Unknown Openings</h2>
                {offBookOpenings.map((opening) => (
                  <div key={`${opening.openingName}-${opening.games}`} className="bg-slate-800/90 rounded p-3">
                    <p className="text-sm font-medium text-slate-100">{opening.openingName}</p>
                    <p className="text-xs text-slate-400">Manual review {opening.manualReviewGames}/{opening.games} | Mapped {opening.mappedGames}/{opening.games} | Success {formatPercent(opening.successRate)}</p>
                    <p className="text-xs text-slate-300">Line sample: {opening.sampleLine.join(" ")}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
                <h2 className="text-lg font-semibold text-slate-100">Training Ideas</h2>
                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                  {trainingIdeas.map((idea) => <li key={idea}>{idea}</li>)}
                </ul>
              </div>
            </section>
          </>
        ) : null}

        {selectedTab === "training" ? (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="xl:col-span-2 bg-slate-900/80 rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-300">
                Actionable items: <span className="text-slate-100 font-semibold">{actionableTrainingItems.length}</span>
                {" | "}High priority: <span className="text-slate-100 font-semibold">{highPriorityTrainingItems}</span>
                {" | "}With errors: <span className="text-slate-100 font-semibold">{trainingItemsWithErrors}</span>
                {" | "}Off-book signals: <span className="text-slate-100 font-semibold">{offBookSignalCount}</span>
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2 xl:max-h-[72vh] xl:overflow-y-auto">
              <h2 className="text-lg font-semibold text-slate-100">Training Plan (Action Queue)</h2>
              <p className="text-xs text-slate-400">Direct tasks for matched variants. Ordered by training errors and priority.</p>
              {actionableTrainingItems.map((item, index) => {
                const target = openingTargetFromLine(item.lineKey);
                return (
                  <div key={item.lineKey} className="bg-slate-800/90 rounded p-3 space-y-1">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <p className="text-sm font-medium text-slate-100">#{index + 1} {buildLineTitle(item.openingName, item.variantName, item.repertoireName)}</p>
                      <div className="flex items-center gap-2">
                        {target ? (
                          <>
                            <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(target.repertoireId, target.variantName)}>See</button>
                            <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(target.repertoireId, target.variantName)}>Train</button>
                          </>
                        ) : null}
                        <label className="text-xs text-slate-300 flex items-center gap-1">
                          <input type="checkbox" checked={item.done} onChange={(event) => { if (trainingPlan?.id) { void markDone(trainingPlan.id, item.lineKey, event.target.checked); } }} />
                          Done
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">Priority {item.priority.toFixed(2)} | {item.effort} | Games {item.games} | Errors {item.trainingErrors || 0}{item.trainingDueAt ? ` | Due ${formatDateTime(item.trainingDueAt)}` : ""}</p>
                    {item.reasons.length > 0 ? <p className="text-xs text-amber-200">Why: {item.reasons.slice(0, 2).join(" | ")}</p> : null}
                    {item.tasks.length > 0 ? <p className="text-xs text-slate-300">Do: {item.tasks.slice(0, 2).join(" | ")}</p> : null}
                    <p className="text-sm text-slate-200">{item.movesSan.join(" ")}</p>
                  </div>
                );
              })}
              {actionableTrainingItems.length === 0 ? <p className="text-sm text-slate-400">No matched actionable items for current filters.</p> : null}
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2 xl:max-h-[72vh] xl:overflow-y-auto">
              <h2 className="text-lg font-semibold text-slate-100">Lines To Focus (Signals)</h2>
              <p className="text-xs text-slate-400">Signals from games. Use this to understand why lines appear in your plan.</p>
              {signalLines.map((line) => {
                const target = openingTargetFromLine(line.lineKey);
                return (
                  <div key={line.lineKey} className="bg-slate-800/90 rounded p-3 space-y-1">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <p className="text-sm font-medium text-slate-100">{buildLineTitle(line.openingName, line.variantName, line.repertoireName)}</p>
                      {target ? (
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(target.repertoireId, target.variantName)}>See</button>
                          <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(target.repertoireId, target.variantName)}>Train</button>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400">Games {line.games} | W {line.wins} D {line.draws} L {line.losses} | Manual review {line.manualReviewGames} | Errors {line.trainingErrors || 0}</p>
                    <p className="text-xs text-slate-400">Mapping confidence {formatPercent(line.averageMappingConfidence)} | Deviation {formatPercent(line.deviationRate)}</p>
                    <p className="text-sm text-slate-200">{line.movesSan.join(" ")}</p>
                  </div>
                );
              })}
              {signalLines.length === 0 ? <p className="text-sm text-slate-400">No focus lines for current filters.</p> : null}
            </div>
          </section>
        ) : null}

        {selectedTab === "sync" ? (
          <>
            <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
              <h2 className="text-lg font-semibold text-slate-100">Linked Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select value={provider} onChange={(event) => setProvider(event.target.value as "lichess" | "chesscom")} className="bg-slate-800 p-2 rounded text-slate-100">
                  {providerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <input value={username} onChange={(event) => setUsername(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Username" />
                <input value={token} onChange={(event) => setToken(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Optional token" />
                <button className="bg-emerald-600 rounded p-2 hover:bg-emerald-500" onClick={connectAccount}>Connect</button>
              </div>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.id} className="flex flex-wrap gap-2 items-center bg-slate-800/90 rounded p-2">
                    <span className="font-medium text-slate-100">{account.provider} | {account.username}</span>
                    <span className="text-xs text-slate-400">Connected: {formatDateTime(account.connectedAt)}</span>
                    <span className="text-xs text-slate-400">Status: {account.status}</span>
                    <span className="text-xs text-slate-400">Last sync: {formatDateTime(account.lastSyncAt)}</span>
                    {account.lastSyncFeedback ? (
                      <span className="text-xs text-slate-400">Last result +{account.lastSyncFeedback.importedCount} | dup {account.lastSyncFeedback.duplicateCount} | fail {account.lastSyncFeedback.failedCount}</span>
                    ) : null}
                    <button className="bg-blue-600 rounded px-2 py-1 text-sm hover:bg-blue-500" onClick={() => { void syncProvider(account.provider); }}>Sync</button>
                    <button className="bg-rose-700 rounded px-2 py-1 text-sm hover:bg-rose-600" onClick={async () => { await removeLinkedAccount(account.provider); await loadData(); }}>Disconnect</button>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
              <h2 className="text-lg font-semibold text-slate-100">Manual PGN Import</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                <input value={tournamentGroup} onChange={(event) => setTournamentGroup(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Tournament group (optional)" />
                <input value={tags} onChange={(event) => setTags(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Tags (comma-separated)" />
              </div>
              <textarea value={manualPgn} onChange={(event) => setManualPgn(event.target.value)} className="w-full min-h-[180px] bg-slate-800 p-2 rounded text-slate-100" placeholder="Paste PGN" />
              <div className="flex gap-2">
                <input type="file" accept=".pgn" onChange={uploadPgnFile} className="text-sm text-slate-300" />
                <button className="bg-indigo-600 rounded px-3 py-2 hover:bg-indigo-500" onClick={() => { void runManualImport(); }}>Import PGN</button>
              </div>
            </section>
          </>
        ) : null}

        {selectedTab === "data" ? (
          <>
            <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
              <h2 className="text-lg font-semibold text-slate-100">Manage Imported Data</h2>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-300">{games.length} games in current filters</p>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded bg-rose-700 text-sm" onClick={() => { void clearFiltered(); }}>Delete filtered games</button>
                  <button className="px-3 py-2 rounded bg-rose-900 text-sm" onClick={() => { void clearAll(); }}>Delete all games</button>
                </div>
              </div>
            </section>
            <section className="space-y-3">
              {gamesByMonthGroups.map(([month, monthGames]) => (
                <div key={month} className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-100">{month}</p>
                  {monthGames.map((game) => (
                    <div key={game.id} className="bg-slate-800/90 rounded p-3 space-y-1 break-words">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-100 break-words">
                          {formatDateTime(game.playedAt)} | {game.source} | {game.orientation || "?"} | {game.timeControlBucket || "unknown speed"} | {game.white} vs {game.black} | {game.result}
                        </p>
                        <div className="flex gap-2">
                          {game.openingMapping.repertoireId ? (
                            <>
                              <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(game.openingMapping.repertoireId as string, game.openingMapping.variantName || getOpeningLabel(game))}>See</button>
                              <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(game.openingMapping.repertoireId as string, game.openingMapping.variantName || getOpeningLabel(game))}>Train</button>
                            </>
                          ) : null}
                          <button className="text-xs px-2 py-1 rounded bg-rose-700" onClick={() => { void deleteImportedGame(game.id).then(async () => { await loadData(); }); }}>Delete</button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-200">{getOpeningLabel(game)}{game.openingDetection.eco ? ` (${game.openingDetection.eco})` : ""}</p>
                      <p className="text-xs text-slate-400">
                        Mapping: {buildLineTitle(getOpeningLabel(game), game.openingMapping.variantName, game.openingMapping.repertoireName)} | Confidence {formatPercent(game.openingMapping.confidence)} | {game.openingMapping.strategy}{game.openingMapping.requiresManualReview ? " | needs review" : ""}
                      </p>
                      <p className="text-sm text-slate-300">{game.movesSan.slice(0, 16).join(" ")}</p>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GamesPage;
