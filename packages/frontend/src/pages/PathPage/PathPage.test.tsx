import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useNavigate } from "react-router-dom";
import PathPage from "./PathPage";
import { usePaths } from "../../hooks/usePaths";
import { useDialogContext } from "../../contexts/DialogContext";
import { useNavigationUtils } from "../../utils/navigationUtils";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../hooks/usePaths", () => ({
  usePaths: jest.fn(),
}));

jest.mock("../../contexts/DialogContext", () => ({
  useDialogContext: jest.fn(),
}));

jest.mock("../../utils/navigationUtils", () => ({
  useNavigationUtils: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockGoToRepertoire = jest.fn();
const mockGoToTrainRepertoire = jest.fn();
const mockLoadPath = jest.fn();
const mockLoadInsights = jest.fn();
const mockRemoveVariantFromPath = jest.fn();
const mockShowConfirmDialog = jest.fn();

const baseUsePaths = {
  path: {
    type: "variant",
    id: "variant-123",
    repertoireId: "repertoire-456",
    repertoireName: "Test Repertoire",
    name: "French Defense",
    errors: 3,
    lastDate: new Date("2026-02-15"),
    dueAt: new Date("2026-02-16"),
  },
  loading: false,
  error: null,
  loadPath: mockLoadPath,
  removeVariantFromPath: mockRemoveVariantFromPath,
  plan: {
    todayKey: "2026-03-07",
    overdueCount: 4,
    dueTodayCount: 2,
    reviewDueCount: 6,
    completedTodayCount: 1,
    completedDueToday: 1,
    completedNewToday: 0,
    newVariantsAvailable: 3,
    suggestedNewToday: 2,
    estimatedTodayTotal: 8,
    upcoming: [],
    forecastDays: [
      {
        date: "2026-03-07",
        dueCount: 2,
        topOpenings: [{ name: "French Defense", count: 2 }],
        variants: [
          {
            repertoireId: "repertoire-456",
            repertoireName: "Test Repertoire",
            variantName: "French Defense",
          },
        ],
      },
    ],
    nextVariants: [
      {
        repertoireId: "repertoire-456",
        repertoireName: "Test Repertoire",
        variantName: "French Defense",
        dueDate: "2026-03-07",
        orientation: "white",
      },
    ],
    upcomingOpenings: [{ name: "French Defense", count: 2 }],
  },
  analytics: {
    rangeStart: "2026-02-07",
    rangeEnd: "2026-03-07",
    totalReviews: 10,
    ratingBreakdown: { again: 1, hard: 2, good: 5, easy: 2 },
    dailyReviews: [],
    topOpenings: [],
    topFens: [],
  },
  insightsLoading: false,
  insightsError: null,
  loadInsights: mockLoadInsights,
};

const renderPage = (initialEntry = "/path") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PathPage />
    </MemoryRouter>
  );

describe("PathPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (usePaths as jest.Mock).mockReturnValue(baseUsePaths);
    (useDialogContext as jest.Mock).mockReturnValue({
      showConfirmDialog: mockShowConfirmDialog,
    });
    (useNavigationUtils as jest.Mock).mockReturnValue({
      goToRepertoire: mockGoToRepertoire,
      goToTrainRepertoire: mockGoToTrainRepertoire,
    });
  });

  it("opens in forecast by default", () => {
    renderPage();

    expect(screen.getByRole("tab", { name: "Path forecast" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Likely Study Path (14 days)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start Review" })).not.toBeInTheDocument();
  });

  it("respects the lesson view query param", () => {
    renderPage("/path?view=lesson");

    expect(screen.getByRole("tab", { name: "Next lesson" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Start Review" })).toBeInTheDocument();
    expect(screen.queryByText("Likely Study Path (14 days)")).not.toBeInTheDocument();
  });

  it("keeps filters and exposes reset scope", () => {
    renderPage();

    fireEvent.change(screen.getByDisplayValue("All Paths"), {
      target: { value: "newVariants" },
    });

    expect(screen.getByText("Type: New variants")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset scope" })).toBeInTheDocument();
  });

  it("keeps lesson actions for study paths", () => {
    (usePaths as jest.Mock).mockReturnValue({
      ...baseUsePaths,
      path: {
        type: "study",
        groupId: "group-123",
        studyId: "study-456",
        name: "Study Queue",
        lastSession: "2026-03-06",
      },
    });

    renderPage("/path?view=lesson");

    fireEvent.click(screen.getByRole("button", { name: "Go to Study" }));

    expect(mockNavigate).toHaveBeenCalledWith("/studies?groupId=group-123&studyId=study-456");
  });

  it("keeps variant removal available in lesson view", () => {
    renderPage("/path?view=lesson");

    fireEvent.click(screen.getByRole("button", { name: "Remove this variant from path" }));

    expect(mockShowConfirmDialog).toHaveBeenCalled();
  });
});
