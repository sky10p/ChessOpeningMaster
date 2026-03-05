import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import * as useDashboardModule from "../../hooks/useDashboard";
import * as usePathsModule from "../../hooks/usePaths";
import { DashboardPage } from "./DashboardPage";
import { IRepertoireDashboard } from "@chess-opening-master/common";

class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserver;

const emptyMoveNode = { id: "root", move: null, children: [] };
const mockRepertoires: IRepertoireDashboard[] = [
  {
    _id: "1",
    name: "Test Repertoire",
    orientation: "white",
    moveNodes: emptyMoveNode,
    variantsInfo: [],
    order: 0,
  },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.spyOn(usePathsModule, "usePaths").mockReturnValue({
      loadPath: jest.fn(),
      loadInsights: jest.fn(),
      path: {
        id: "path-1",
        type: "newVariant",
        repertoireId: "1",
        repertoireName: "Test Repertoire",
        name: "Italian Game",
      } as never,
      plan: {
        overdueCount: 0,
        dueTodayCount: 0,
        reviewDueCount: 0,
        completedDueToday: 0,
        completedNewToday: 0,
        completedTodayCount: 0,
        suggestedNewToday: 0,
        estimatedTodayTotal: 0,
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
    });

    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: mockRepertoires,
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Today landing page", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /start new variant/i })).toHaveLength(2);
    expect(screen.getByRole("button", { name: /open library/i })).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("shows the queue summary instead of legacy dashboard tabs", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Italian Game/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended next action/i)).toBeInTheDocument();
  });
});
