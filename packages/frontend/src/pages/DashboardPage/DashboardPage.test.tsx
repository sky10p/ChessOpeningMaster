import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import * as useDashboardModule from "../../hooks/useDashboard";
import * as pathInsightsHookModule from "./sections/DashboardSection/hooks/usePathInsights";
import * as trainRepository from "../../repository/train/train";
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
    jest.spyOn(trainRepository, "getCachedTrainOverview").mockImplementation(
      () => new Promise(() => undefined)
    );

    jest.spyOn(pathInsightsHookModule, "usePathInsights").mockReturnValue({
      pathPlan: {
        todayKey: "2026-02-15",
        overdueCount: 0,
        dueTodayCount: 0,
        reviewDueCount: 0,
        completedTodayCount: 0,
        newVariantsAvailable: 0,
        suggestedNewToday: 0,
        estimatedTodayTotal: 0,
        upcoming: [],
        forecastDays: [],
        nextVariants: [],
        upcomingOpenings: [],
      },
      pathAnalytics: {
        rangeStart: "2026-01-17",
        rangeEnd: "2026-02-15",
        totalReviews: 0,
        ratingBreakdown: { again: 0, hard: 0, good: 0, easy: 0 },
        dailyReviews: [],
        topOpenings: [],
        topFens: [],
      },
      loadingPathInsights: false,
      pathInsightsError: null,
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

  it("renders the reduced dashboard tab set", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByRole("tab", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /path insights/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /studies/i })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /repertoires/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /openings/i })).not.toBeInTheDocument();
  });

  it("redirects legacy openings dashboard links to /repertoires filters", async () => {
    window.history.pushState({}, "", "/dashboard?section=openings&status=errors");

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe("/repertoires");
      expect(window.location.search).toBe("?status=errors");
    });
  });
});
