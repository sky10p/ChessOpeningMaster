import React from "react";
import { useNavigate } from "react-router-dom";
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

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState<GamesTab>("insights");
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

      {selectedTab !== "sync" ? <GamesFiltersBar filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} applyFilters={applyFilters} resetFilters={resetFilters} /> : null}

      {selectedTab !== "sync" ? (
        <GamesFiltersDrawer
          show={showMobileFilters}
          filtersDraft={filtersDraft}
          setFiltersDraft={setFiltersDraft}
          applyFiltersMobile={applyFiltersMobile}
          resetFilters={resetFilters}
          setShowMobileFilters={setShowMobileFilters}
        />
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-20 pt-3 sm:p-4 space-y-4 sm:space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>
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
