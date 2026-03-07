import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";
import * as usePathsModule from "../../hooks/usePaths";
import * as navigationUtilsModule from "../../utils/navigationUtils";
import { DashboardPage } from "./DashboardPage";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserver;

const mockNavigate = jest.fn();
const mockGoToRepertoire = jest.fn();
const mockGoToTrainRepertoire = jest.fn();
const mockLoadPath = jest.fn();
const mockLoadInsights = jest.fn();

const baseUsePaths = {
  loadPath: mockLoadPath,
  loadInsights: mockLoadInsights,
  path: {
    id: "path-1",
    type: "newVariant",
    repertoireId: "1",
    repertoireName: "Test Repertoire",
    name: "Italian Game",
  } as never,
  plan: {
    overdueCount: 2,
    dueTodayCount: 3,
    reviewDueCount: 3,
    completedDueToday: 1,
    completedNewToday: 1,
    completedTodayCount: 2,
    suggestedNewToday: 2,
    estimatedTodayTotal: 5,
    forecastDays: [],
  } as never,
  loading: false,
  error: null,
  removeVariantFromPath: jest.fn(),
  category: undefined,
  setCategory: jest.fn(),
  filters: {},
  setFilters: jest.fn(),
  analytics: null,
  insightsLoading: false,
  insightsError: null,
};

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    jest.spyOn(usePathsModule, "usePaths").mockReturnValue(baseUsePaths as never);
    jest.spyOn(navigationUtilsModule, "useNavigationUtils").mockReturnValue({
      goToRepertoire: mockGoToRepertoire,
      goToTrainRepertoire: mockGoToTrainRepertoire,
      goToTrainRepertoireWithVariants: jest.fn(),
      goToTrainOpening: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the focused Today landing page without legacy summary blocks", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Path" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start review" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Focus train" })).toBeInTheDocument();
    expect(screen.queryByText("Variants tracked")).not.toBeInTheDocument();
    expect(screen.queryByText("Reviewed with errors")).not.toBeInTheDocument();
    expect(screen.queryByText("This week")).not.toBeInTheDocument();
  });

  it("executes the real review action for variant paths", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Start review" }));

    expect(mockGoToRepertoire).toHaveBeenCalledWith("1", "Italian Game");
    expect(mockNavigate).not.toHaveBeenCalledWith("/path?view=forecast");
  });

  it("executes focus train directly for variant paths", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Focus train" }));

    expect(mockGoToTrainRepertoire).toHaveBeenCalledWith("1", "Italian Game");
  });

  it("opens the study directly for study paths", () => {
    (usePathsModule.usePaths as jest.Mock).mockReturnValue({
      ...baseUsePaths,
      path: {
        type: "study",
        groupId: "group-1",
        studyId: "study-1",
        name: "Endgame Study",
        lastSession: "2026-03-06",
      },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open study" }));

    expect(mockNavigate).toHaveBeenCalledWith("/studies?groupId=group-1&studyId=study-1");
    expect(screen.queryByRole("button", { name: "Focus train" })).not.toBeInTheDocument();
  });

  it("falls back to Path forecast when there is no immediate lesson", () => {
    (usePathsModule.usePaths as jest.Mock).mockReturnValue({
      ...baseUsePaths,
      path: { message: "All caught up" },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open forecast" }));

    expect(mockNavigate).toHaveBeenCalledWith("/path?view=forecast");
    expect(screen.queryByRole("button", { name: "Focus train" })).not.toBeInTheDocument();
  });
});
