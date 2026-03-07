import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import RepertoireOpeningPage from "./RepertoireOpeningPage";
import * as trainRepository from "../../repository/train/train";
import {
  getRepertoireEditorRoute,
  getRepertoiresRoute,
  getTrainRepertoireRoute,
} from "../../utils/appRoutes";

const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useLocation: () => mockUseLocation(),
}));

const openingPayload = {
  repertoireId: "rep-1",
  repertoireName: "Main White",
  openingName: "Italian Game",
  orientation: "white" as const,
  openingFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  stats: {
    masteryScore: 70,
    dueVariantsCount: 1,
    dueMistakesCount: 2,
    totalVariantsCount: 2,
    mistakesReducedLast7Days: 3,
  },
  variants: [
    {
      repertoireId: "rep-1",
      variantName: "Italian Game: Main Line",
      openingName: "Italian Game",
      orientation: "white" as const,
      errors: 1,
      dueAt: new Date("2025-01-01T00:00:00.000Z"),
      lastReviewedDayKey: "2024-01-01",
      masteryScore: 60,
      perfectRunStreak: 1,
      dailyErrorCount: 1,
      lastRating: "good" as const,
    },
  ],
  mistakes: [
    {
      repertoireId: "rep-1",
      variantName: "Italian Game: Main Line",
      openingName: "Italian Game",
      orientation: "white" as const,
      mistakeKey: "k1",
      positionFen: "fen",
      variantStartFen: "fen",
      variantStartPly: 0,
      mistakePly: 6,
      expectedMoveLan: "e4e5",
      expectedMoveSan: "e5",
      seenCount: 1,
      solvedCount: 0,
      dueAt: new Date("2025-01-01T00:00:00.000Z"),
      lastReviewedDayKey: "2024-01-01",
      state: "learning" as const,
      stability: 1,
      difficulty: 4,
      reps: 0,
      lapses: 0,
      intervalDays: 1,
      ease: 2.3,
      lastRating: null,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    },
  ],
};

describe("RepertoireOpeningPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({
      repertoireId: "rep-1",
      openingName: "Italian Game",
    });
    mockUseLocation.mockReturnValue({ search: "" });
    jest.spyOn(trainRepository, "getTrainOpening").mockResolvedValue(openingPayload);
  });

  it("falls back to /repertoires when no return target is provided", async () => {
    render(
      <MemoryRouter>
        <RepertoireOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(mockNavigate).toHaveBeenCalledWith(getRepertoiresRoute());
  });

  it("falls back to /repertoires when returnTo is invalid", async () => {
    mockUseLocation.mockReturnValue({ search: "?returnTo=javascript:alert(1)" });

    render(
      <MemoryRouter>
        <RepertoireOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(mockNavigate).toHaveBeenCalledWith(getRepertoiresRoute());
  });

  it("honors a valid returnTo target", async () => {
    mockUseLocation.mockReturnValue({ search: "?returnTo=%2Frepertoires%3Fstatus%3Derrors" });

    render(
      <MemoryRouter>
        <RepertoireOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(mockNavigate).toHaveBeenCalledWith("/repertoires?status=errors");
  });

  it("starts standard training on the canonical train route", async () => {
    render(
      <MemoryRouter>
        <RepertoireOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Start review" })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        getTrainRepertoireRoute(
          "rep-1",
          "mode=standard&openingName=Italian+Game&variantNames=Italian+Game%3A+Main+Line"
        )
      );
    });
  });

  it("opens the opening and variants in the repertoire editor context", async () => {
    render(
      <MemoryRouter>
        <RepertoireOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Open editor" })[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      getRepertoireEditorRoute("rep-1", { variantName: "Italian Game" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Open line" }));
    expect(mockNavigate).toHaveBeenCalledWith(
      getRepertoireEditorRoute("rep-1", { variantName: "Italian Game: Main Line" })
    );
  });
});
