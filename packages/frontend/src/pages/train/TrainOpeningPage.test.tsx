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

describe("TrainOpeningPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates with standard mode query when train all variants is clicked", async () => {
    jest.spyOn(trainRepository, "getTrainOpening").mockResolvedValue({
      repertoireId: "rep-1",
      repertoireName: "Main White",
      openingName: "Italian Game",
      orientation: "white",
      openingFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      stats: {
        masteryScore: 70,
        dueVariantsCount: 1,
        dueMistakesCount: 1,
        totalVariantsCount: 2,
        mistakesReducedLast7Days: 3,
      },
      variants: [
        {
          repertoireId: "rep-1",
          variantName: "Italian Game: Main Line",
          openingName: "Italian Game",
          orientation: "white",
          errors: 1,
          dueAt: new Date("2025-01-01T00:00:00.000Z"),
          lastReviewedDayKey: "2024-01-01",
          masteryScore: 60,
          perfectRunStreak: 1,
          dailyErrorCount: 1,
          lastRating: "good",
        },
      ],
      mistakes: [
        {
          repertoireId: "rep-1",
          variantName: "Italian Game: Main Line",
          openingName: "Italian Game",
          orientation: "white",
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
          state: "learning",
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
    });

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
});
