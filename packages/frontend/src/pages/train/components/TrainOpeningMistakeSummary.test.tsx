import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { VariantMistake } from "@chess-opening-master/common";
import { TrainOpeningMistakeSummary } from "./TrainOpeningMistakeSummary";

const createMistake = (overrides: Partial<VariantMistake>): VariantMistake => ({
  repertoireId: "rep-1",
  variantName: "Italian Game: Main Line",
  openingName: "Italian Game",
  orientation: "white",
  mistakeKey: "mistake-1",
  positionFen: "fen",
  variantStartFen: "fen",
  variantStartPly: 0,
  mistakePly: 6,
  expectedMoveLan: "e4e5",
  expectedMoveSan: "e5",
  seenCount: 1,
  solvedCount: 0,
  dueAt: new Date("2000-01-01T00:00:00.000Z"),
  lastReviewedDayKey: "1999-01-01",
  state: "learning",
  stability: 1,
  difficulty: 4,
  reps: 0,
  lapses: 0,
  intervalDays: 1,
  ease: 2.3,
  lastRating: null,
  createdAt: new Date("2000-01-01T00:00:00.000Z"),
  updatedAt: new Date("2000-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("TrainOpeningMistakeSummary", () => {
  it("shows due mistakes first and limits compact mobile output", () => {
    render(
      <TrainOpeningMistakeSummary
        mistakes={[
          createMistake({
            mistakeKey: "future",
            variantName: "Italian Game: Quiet Line",
            dueAt: new Date("2999-01-01T00:00:00.000Z"),
          }),
          createMistake({
            mistakeKey: "due",
            variantName: "Italian Game: Main Line",
          }),
        ]}
        onReviewDueMistakes={jest.fn()}
        onTrainSpecificMistake={jest.fn()}
        compact
        visibleLimit={1}
      />
    );

    expect(screen.queryByText("Review stored errors separately when a line needs reinforcement instead of a full opening run.")).not.toBeInTheDocument();
    expect(screen.getByText("Italian Game: Main Line")).toBeInTheDocument();
    expect(screen.queryByText("Italian Game: Quiet Line")).not.toBeInTheDocument();
    expect(screen.queryByText("Key due")).not.toBeInTheDocument();
  });
});
