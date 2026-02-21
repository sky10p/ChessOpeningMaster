import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowPathIcon,
  ChartBarIcon,
  AcademicCapIcon,
  CloudArrowDownIcon,
  CircleStackIcon,
  FunnelIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { providerOptions, tabs } from "./constants";
import GamesFiltersBar from "./components/GamesFiltersBar";
import GamesFiltersDrawer from "./components/GamesFiltersDrawer";
import { useGamesData } from "./hooks/useGamesData";
import { useGamesFilters } from "./hooks/useGamesFilters";
import { useGamesInsights } from "./hooks/useGamesInsights";
import DataTab from "./tabs/DataTab";
import InsightsTab from "./tabs/InsightsTab";
import SyncTab from "./tabs/SyncTab";
import TrainingTab from "./tabs/TrainingTab";
import { GamesTab } from "./types";

const TAB_ICONS: Record<GamesTab, React.ReactNode> = {
  insights: <ChartBarIcon className="w-4 h-4" />,
  training: <AcademicCapIcon className="w-4 h-4" />,
  sync: <CloudArrowDownIcon className="w-4 h-4" />,
  data: <CircleStackIcon className="w-4 h-4" />,
};

const isGamesTab = (value: string | null): value is GamesTab => tabs.some((tab) => tab.id === value);

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = isGamesTab(searchParams.get("tab")) ? (searchParams.get("tab") as GamesTab) : "insights";
  const {
    filtersDraft,
    showMobileFilters,
    setFiltersDraft,
    setShowMobileFilters,
    applyFilters,
    applyFiltersMobile,
    resetFilters,
    activeFiltersCount,
    appliedQuery,
  } = useGamesFilters();
  const {
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
  } = useGamesData(appliedQuery);
  const {
    mappedRatio,
    manualReviewRatio,
    wdl,
    variantPerformance,
    weakestVariants,
    strongestVariants,
    actionableTrainingItems,
    signalLines,
    trainingItemsWithErrors,
    highPriorityTrainingItems,
    offBookSignalCount,
    offBookOpenings,
    gamesByMonth,
    maxMonthGames,
    gamesByMonthGroups,
    trainingIdeas,
    openingTargetFromLine,
  } = useGamesInsights(stats, games, trainingPlan);

  const openRepertoire = React.useCallback((repertoireId: string, variantName?: string) => {
    const variantQuery = variantName ? `?variantName=${encodeURIComponent(variantName)}` : "";
    navigate(`/repertoire/${repertoireId}${variantQuery}`);
  }, [navigate]);

  const openTrainRepertoire = React.useCallback((repertoireId: string, variantName?: string) => {
    const variantQuery = variantName ? `?variantName=${encodeURIComponent(variantName)}` : "";
    navigate(`/repertoire/train/${repertoireId}${variantQuery}`);
  }, [navigate]);

  const showFilters = selectedTab !== "sync";

  return (
    <div className="w-full h-full min-h-0 self-stretch bg-slate-950 rounded-none sm:rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-800/60">

      {/* ── Header ── */}
      <header className="shrink-0 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-slate-100">Games Intelligence</h1>

          <div className="flex items-center gap-2">
            <button
              title="Refresh data"
              onClick={() => { void loadData(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              title="Regenerate training plan"
              onClick={regeneratePlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Regenerate Plan</span>
              <span className="sm:hidden">Plan</span>
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-2 rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-slate-200">{message}</div>
        ) : null}
      </header>

      {/* ── Tab bar ── */}
      <div className="shrink-0 flex items-stretch bg-slate-900 border-b border-slate-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const active = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("tab", tab.id);
                setSearchParams(next);
              }}
              className={`
                flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                ${active
                  ? "border-blue-500 text-blue-400 bg-slate-800/60"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }
              `}
            >
              {TAB_ICONS[tab.id]}
              {tab.label}
            </button>
          );
        })}

        {showFilters ? (
          <div className="sm:hidden ml-auto flex items-center pr-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              Filters
              {activeFiltersCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              ) : null}
            </button>
          </div>
        ) : null}
      </div>

      {/* ── Desktop filter bar ── */}
      {showFilters ? (
        <GamesFiltersBar
          filtersDraft={filtersDraft}
          setFiltersDraft={setFiltersDraft}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
        />
      ) : null}

      {/* ── Mobile filter drawer ── */}
      {showFilters ? (
        <GamesFiltersDrawer
          show={showMobileFilters}
          filtersDraft={filtersDraft}
          setFiltersDraft={setFiltersDraft}
          applyFiltersMobile={applyFiltersMobile}
          resetFilters={resetFilters}
          setShowMobileFilters={setShowMobileFilters}
        />
      ) : null}

      {/* ── Tab content ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-20 pt-4 sm:px-5 sm:pb-10 space-y-4 sm:space-y-5"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {selectedTab === "insights" ? (
          <InsightsTab
            stats={stats}
            mappedRatio={mappedRatio}
            manualReviewRatio={manualReviewRatio}
            wdl={wdl}
            gamesByMonth={gamesByMonth}
            maxMonthGames={maxMonthGames}
            variantPerformance={variantPerformance}
            weakestVariants={weakestVariants}
            strongestVariants={strongestVariants}
            offBookOpenings={offBookOpenings}
            trainingIdeas={trainingIdeas}
            openRepertoire={openRepertoire}
            openTrainRepertoire={openTrainRepertoire}
          />
        ) : null}

        {selectedTab === "training" ? (
          <TrainingTab
            trainingPlanId={trainingPlan?.id}
            actionableTrainingItems={actionableTrainingItems}
            signalLines={signalLines}
            trainingItemsWithErrors={trainingItemsWithErrors}
            highPriorityTrainingItems={highPriorityTrainingItems}
            offBookSignalCount={offBookSignalCount}
            openingTargetFromLine={openingTargetFromLine}
            openRepertoire={openRepertoire}
            openTrainRepertoire={openTrainRepertoire}
            markDone={markDone}
          />
        ) : null}

        {selectedTab === "sync" ? (
          <SyncTab
            state={{
              provider,
              providerOptions,
              username,
              token,
              manualPgn,
              tags,
              tournamentGroup,
              accounts,
            }}
            actions={{
              setProvider,
              setUsername,
              setToken,
              setManualPgn,
              setTags,
              setTournamentGroup,
              connectAccount,
              syncProvider,
              forceSyncAll,
              disconnectAccount,
              uploadPgnFile,
              runManualImport,
            }}
          />
        ) : null}

        {selectedTab === "data" ? (
          <DataTab
            games={games}
            gamesByMonthGroups={gamesByMonthGroups}
            clearFiltered={clearFiltered}
            clearAll={clearAll}
            removeGame={removeGame}
            openRepertoire={openRepertoire}
            openTrainRepertoire={openTrainRepertoire}
          />
        ) : null}
      </div>
    </div>
  );
};

export default GamesPage;
