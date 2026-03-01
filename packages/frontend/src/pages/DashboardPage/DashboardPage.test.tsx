/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as useDashboardModule from "../../hooks/useDashboard";
import { DashboardPage } from "./DashboardPage";
import "@testing-library/jest-dom";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { Color, Square, PieceSymbol } from "chess.js";
import * as pathInsightsHookModule from "./sections/DashboardSection/hooks/usePathInsights";
import * as trainRepository from "../../repository/train/train";

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
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

  it("renders Dashboard and Openings tabs", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByRole("tab", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /openings/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /path insights/i })).toBeInTheDocument();
  });

  it("shows Dashboard section by default", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Key statistics and metrics for your chess repertoires./i)).toBeInTheDocument();
  });

  it("switches to Openings section when tab is clicked", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    expect(screen.getByText(/browse your prepared openings/i)).toBeInTheDocument();
  });

  it("switches to Path Insights section when tab is clicked", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /path insights/i }));
    expect(screen.getByText(/forecast your review queue/i)).toBeInTheDocument();
    expect(screen.getByText(/spaced repetition insights/i)).toBeInTheDocument();
  });

  it("navigates to openings with errors selected from the dashboard CTA", async () => {
    window.history.pushState({}, "", "/dashboard?section=dashboard");

    const errorRepertoire: IRepertoireDashboard = {
      _id: "1",
      name: "Test Repertoire",
      orientation: "white",
      moveNodes: {
        id: "root",
        move: null,
        children: [
          {
            id: "variant-1",
            move: {
              from: "e2" as Square,
              to: "e4" as Square,
              lan: "e2e4",
              san: "e4",
              color: "w" as Color,
              flags: "b",
              piece: "p" as PieceSymbol,
              before: "start_fen",
              after: "after_e2e4_fen",
            },
            variantName: "Italian Game",
            children: [],
          },
        ],
      },
      variantsInfo: [
        {
          variantName: "Italian Game",
          repertoireId: "1",
          errors: 2,
          lastDate: new Date(),
        },
      ],
      order: 0,
    };

    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [errorRepertoire],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /see errors/i }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /openings/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByLabelText("Status")).toHaveValue("errors");
    });
  });
});

describe("Openings section behaviors", () => {
  const validMove = {
    from: "e2" as Square,
    to: "e4" as Square,
    lan: "e2e4",
    san: "e4",
    color: "w" as Color,
    flags: "b",
    piece: "p" as PieceSymbol,
    before: "start_fen",
    after: "after_e2e4_fen",
  };

  const openingMoveNode = (name: string) => ({
    id: "root",
    move: null,
    children: [
      {
        id: name,
        move: validMove,
        variantName: name,
        children: [],
      },
    ],
  });

  const makeRep = (
    id: string,
    name: string,
    orientation: "white" | "black",
    openingName: string
  ): IRepertoireDashboard => ({
    _id: id,
    name,
    orientation,
    moveNodes: openingMoveNode(openingName),
    variantsInfo: [
      {
        variantName: openingName,
        repertoireId: id,
        errors: 0,
        lastDate: new Date(),
      },
    ],
    order: 0,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows single repertoire directly for an opening", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [makeRep("1", "Rep1", "white", "Ruy Lopez")],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    expect(screen.getByText("Ruy Lopez")).toBeInTheDocument();
    expect(screen.getByText(/Rep1/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Expand/i })).not.toBeInTheDocument();
  });

  it("shows expand/collapse for multiple repertoires for an opening", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [
        makeRep("1", "Rep1", "white", "Ruy Lopez"),
        makeRep("2", "Rep2", "black", "Ruy Lopez"),
      ],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    expect(screen.getByText("Ruy Lopez")).toBeInTheDocument();
    const showBtn = screen.getByRole("button", { name: /Expand/i });
    expect(showBtn).toBeInTheDocument();
    fireEvent.click(showBtn);
    expect(screen.getByText("Rep1")).toBeInTheDocument();
    expect(screen.getByText("Rep2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Collapse/i }));
    expect(screen.queryByText("Rep1")).not.toBeInTheDocument();
  });

  it("shows 'No repertoires' if none for an opening", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    expect(screen.queryByText("Ruy Lopez")).not.toBeInTheDocument();
    expect(screen.queryByText("Italian Game")).not.toBeInTheDocument();
  });

  it("filters openings by name", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [
        makeRep("1", "Rep1", "white", "Ruy Lopez"),
        makeRep("2", "Rep2", "black", "Italian Game"),
      ],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    const filterInput = screen.getByPlaceholderText(/filter openings/i);
    fireEvent.change(filterInput, { target: { value: "italian" } });
    expect(screen.getByText("Italian Game")).toBeInTheDocument();
    expect(screen.queryByText("Ruy Lopez")).not.toBeInTheDocument();
  });

  it("filters openings by orientation and repertoire selection together", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [
        makeRep("1", "White Rep 1", "white", "Ruy Lopez"),
        makeRep("2", "White Rep 2", "white", "Italian Game"),
        makeRep("3", "Black Rep 1", "black", "Sicilian Defense"),
      ],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));

    fireEvent.change(screen.getByLabelText("Color"), {
      target: { value: "white" },
    });

    expect(screen.getByRole("button", { name: /all white repertoires/i })).toBeInTheDocument();
    expect(screen.getByText("Ruy Lopez")).toBeInTheDocument();
    expect(screen.getByText("Italian Game")).toBeInTheDocument();
    expect(screen.queryByText("Sicilian Defense")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /all white repertoires/i }));
    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }));

    expect(screen.getByText(/no repertoires/i)).toBeInTheDocument();
    expect(screen.queryByText("Ruy Lopez")).not.toBeInTheDocument();
    expect(screen.queryByText("Italian Game")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^select all$/i }));

    expect(screen.getByText("Ruy Lopez")).toBeInTheDocument();
    expect(screen.getByText("Italian Game")).toBeInTheDocument();
    expect(screen.queryByText("Sicilian Defense")).not.toBeInTheDocument();
  });

  it("View button is present and clickable in Openings section", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [makeRep("1", "Rep1", "white", "Ruy Lopez")],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    const viewBtn = screen.getByRole("button", { name: /View repertoire/i });
    expect(viewBtn).toBeInTheDocument();
    fireEvent.click(viewBtn);
  });

  it("announces repertoire selection state in the dropdown", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [makeRep("1", "Rep1", "white", "Ruy Lopez")],
      loading: false,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("tab", { name: /openings/i }));
    fireEvent.click(screen.getByRole("button", { name: /all repertoires/i }));

    const repertoireToggle = screen.getByRole("button", { name: /rep1/i });
    expect(repertoireToggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(repertoireToggle);
    expect(repertoireToggle).toHaveAttribute("aria-pressed", "false");
  });
});
