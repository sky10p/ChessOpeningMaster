import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TrainOpeningPage from "./TrainOpeningPage";
import * as trainRepository from "../../repository/train/train";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    repertoireId: "rep-1",
    openingName: "Italian%20Game",
  }),
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
    {
      repertoireId: "rep-1",
      variantName: "Italian Game: Main Line",
      openingName: "Italian Game",
      orientation: "white" as const,
      mistakeKey: "k2",
      positionFen: "fen-2",
      variantStartFen: "fen",
      variantStartPly: 0,
      mistakePly: 8,
      expectedMoveLan: "f1c4",
      expectedMoveSan: "Bc4",
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

describe("TrainOpeningPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates with standard mode query when train all variants is clicked", async () => {
    jest.spyOn(trainRepository, "getTrainOpening").mockResolvedValue(openingPayload);

    render(
      <MemoryRouter>
        <TrainOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Train All Variants" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/repertoire/train/rep-1?mode=standard&openingName=Italian+Game&variantNames=Italian+Game%3A+Main+Line"
      );
    });
  });

  it("navigates to review-only mistake session with all mistake keys", async () => {
    jest.spyOn(trainRepository, "getTrainOpening").mockResolvedValue(openingPayload);

    render(
      <MemoryRouter>
        <TrainOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Train Mistakes Only" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/repertoire/train/rep-1?mode=mistakes&openingName=Italian+Game&mistakeKeys=k1%7Ck2"
      );
    });
  });

  it("navigates to review-only session for a specific mistake key", async () => {
    jest.spyOn(trainRepository, "getTrainOpening").mockResolvedValue(openingPayload);

    render(
      <MemoryRouter>
        <TrainOpeningPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Italian Game")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Train This Mistake" })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/repertoire/train/rep-1?mode=mistakes&openingName=Italian+Game&variantName=Italian+Game%3A+Main+Line&mistakeKey=k1"
      );
    });
  });
});
