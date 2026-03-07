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
import { Button, Badge, Tabs, TabButton, PageHeader, StatStrip } from "../../components/ui";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { buildTrainExecutionSearch, getRepertoireEditorRoute, getTrainRepertoireRoute } from "../../utils/appRoutes";

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
    navigate(getRepertoireEditorRoute(repertoireId, variantName ? { variantName } : undefined));
  }, [navigate]);

  const openTrainRepertoire = React.useCallback((repertoireId: string, variantName?: string) => {
    navigate(getTrainRepertoireRoute(repertoireId, buildTrainExecutionSearch({ variantName })));
  }, [navigate]);

  const showFilters = selectedTab !== "sync";

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <PageHeader
            eyebrow="Games intelligence"
            title="Games"
            description="Convert imported games into training signals, mapping confidence, and sync operations without losing the task hierarchy."
            primaryAction={
              <Button
                intent="primary"
                size="md"
                title="Regenerate training plan"
                onClick={regeneratePlan}
              >
                <SparklesIcon className="w-4 h-4" />
                Regenerate plan
              </Button>
            }
            secondaryActions={
              <Button
                intent="secondary"
                size="md"
                title="Refresh data"
                onClick={() => {
                  void loadData();
                }}
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
            meta={
              message ? (
                <Badge variant="info" size="sm">
                  {message}
                </Badge>
              ) : undefined
            }
          />

          <StatStrip
            items={[
              {
                label: "Games",
                value: stats?.totalGames ?? 0,
                tone: "default",
                detail: `${stats?.uniqueLines ?? 0} unique lines`,
              },
              {
                label: "Mapped",
                value: `${Math.round(mappedRatio * 100)}%`,
                tone: "brand",
                detail: "Connected to repertoire lines",
              },
              {
                label: "Off-book",
                value: `${Math.round(manualReviewRatio * 100)}%`,
                tone: "warning",
                detail: "Needs manual review",
              },
              {
                label: "Training queue",
                value: actionableTrainingItems.length,
                tone: "accent",
                detail: `${highPriorityTrainingItems} high priority`,
              },
            ]}
          />

          <Tabs variant="pill" className="shrink-0 gap-1 p-2 sm:p-3 bg-surface border-b border-border-subtle">
            {tabs.map((tab) => {
              const active = selectedTab === tab.id;
              return (
                <TabButton
                  key={tab.id}
                  variant="pill"
                  active={active}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("tab", tab.id);
                    setSearchParams(next);
                  }}
                >
                  {TAB_ICONS[tab.id]}
                  {tab.label}
                </TabButton>
              );
            })}

            {showFilters ? (
              <div className="sm:hidden ml-auto flex items-center pr-3">
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="relative"
                >
                  <FunnelIcon className="w-3.5 h-3.5" />
                  Filters
                  {activeFiltersCount > 0 ? (
                    <Badge variant="brand" size="sm" className="absolute -top-1.5 -right-1.5 rounded-full">
                      {activeFiltersCount}
                    </Badge>
                  ) : null}
                </Button>
              </div>
            ) : null}
          </Tabs>

          {showFilters ? (
            <GamesFiltersBar
              filtersDraft={filtersDraft}
              setFiltersDraft={setFiltersDraft}
              applyFilters={applyFilters}
              resetFilters={resetFilters}
            />
          ) : null}

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

          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-20 pt-4 sm:px-5 sm:pb-10 space-y-4 sm:space-y-5"
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
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};

export default GamesPage;
