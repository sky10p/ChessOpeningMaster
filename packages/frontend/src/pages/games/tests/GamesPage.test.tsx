import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GamesPage from "../GamesPage";

const mockUseGamesFilters = jest.fn();
const mockUseGamesData = jest.fn();
const mockUseGamesInsights = jest.fn();

jest.mock("../hooks/useGamesFilters", () => ({
  useGamesFilters: () => mockUseGamesFilters(),
}));

jest.mock("../hooks/useGamesData", () => ({
  useGamesData: () => mockUseGamesData(),
}));

jest.mock("../hooks/useGamesInsights", () => ({
  useGamesInsights: () => mockUseGamesInsights(),
}));

jest.mock("../../../hooks/useIsMobile", () => ({
  useIsMobile: () => true,
}));

jest.mock("../tabs/InsightsTab", () => () => <div>Insights Content</div>);
jest.mock("../tabs/TrainingTab", () => () => <div>Training Content</div>);
jest.mock("../tabs/SyncTab", () => () => <div>Sync Content</div>);
jest.mock("../tabs/DataTab", () => () => <div>Data Content</div>);

const baseFilters = {
  filtersDraft: {
    source: "all",
    color: "all",
    mapped: "all",
    timeControlBucket: "all",
    openingQuery: "",
    dateFrom: "",
    dateTo: "",
  },
  showMobileFilters: false,
  setFiltersDraft: jest.fn(),
  setShowMobileFilters: jest.fn(),
  applyFilters: jest.fn(),
  applyFiltersMobile: jest.fn(),
  resetFilters: jest.fn(),
  activeFiltersCount: 2,
  appliedQuery: {},
};

const baseData = {
  accounts: [],
  stats: {
    totalGames: 673,
    uniqueLines: 576,
  },
  games: [],
  trainingPlan: null,
  loading: false,
  message: null,
  provider: "lichess",
  username: "",
  token: "",
  manualPgn: "",
  tags: "",
  tournamentGroup: "",
  setProvider: jest.fn(),
  setUsername: jest.fn(),
  setToken: jest.fn(),
  setManualPgn: jest.fn(),
  setTags: jest.fn(),
  setTournamentGroup: jest.fn(),
  loadData: jest.fn(),
  connectAccount: jest.fn(),
  syncProvider: jest.fn(),
  runManualImport: jest.fn(),
  uploadPgnFile: jest.fn(),
  regeneratePlan: jest.fn(),
  forceSyncAll: jest.fn(),
  markDone: jest.fn(),
  clearFiltered: jest.fn(),
  clearAll: jest.fn(),
  disconnectAccount: jest.fn(),
  removeGame: jest.fn(),
};

const baseInsights = {
  mappedRatio: 1,
  manualReviewRatio: 0.05,
  wdl: { win: 0.5, draw: 0.1, loss: 0.4 },
  variantPerformance: [],
  weakestVariants: [],
  strongestVariants: [],
  actionableTrainingItems: new Array(12).fill(null),
  signalLines: [],
  trainingItemsWithErrors: 0,
  highPriorityTrainingItems: 8,
  offBookSignalCount: 2,
  offBookOpenings: [],
  gamesByMonth: [],
  gamesByMonthGroups: [],
  trainingIdeas: [],
  openingTargetFromLine: jest.fn(),
};

describe("GamesPage mobile layout", () => {
  beforeEach(() => {
    mockUseGamesFilters.mockReturnValue(baseFilters);
    mockUseGamesData.mockReturnValue(baseData);
    mockUseGamesInsights.mockReturnValue(baseInsights);
  });

  it("shows the mobile action bar with refresh, plan, and filters badge", () => {
    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan" })).toBeInTheDocument();

    const filtersButton = screen.getAllByRole("button").find((button) => button.textContent?.includes("Filters"));
    expect(filtersButton).toBeTruthy();
    expect(within(filtersButton as HTMLElement).getByText("2")).toBeInTheDocument();
  });

  it("renders the mobile stat strip after the active tab content", () => {
    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>
    );

    const content = screen.getByText("Insights Content");
    const statDetails = screen.getAllByText("Connected to repertoire lines");
    const statDetail = statDetails[statDetails.length - 1];

    expect(statDetail).toBeTruthy();
    expect(content.compareDocumentPosition(statDetail as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
