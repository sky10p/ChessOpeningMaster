import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TrainOpeningVariantList } from "./TrainOpeningVariantList";

const variants = [
  {
    repertoireId: "rep-1",
    variantName: "Italian Game: Main Line",
    openingName: "Italian Game",
    orientation: "white" as const,
    errors: 1,
    dueAt: new Date("2000-01-01T00:00:00.000Z"),
    lastReviewedDayKey: "1999-01-01",
    masteryScore: 60,
    perfectRunStreak: 1,
    dailyErrorCount: 2,
    lastRating: "good" as const,
  },
];

describe("TrainOpeningVariantList", () => {
  it("uses the compact mobile action priority and hides dense metadata", () => {
    render(
      <TrainOpeningVariantList
        variants={variants}
        onViewVariant={jest.fn()}
        onTrainVariantNormal={jest.fn()}
        onTrainVariantFocus={jest.fn()}
        compact
      />
    );

    expect(screen.queryByText("Use targeted training when one line needs extra repetition instead of rerunning the whole opening.")).not.toBeInTheDocument();
    expect(screen.queryByText("Streak 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Rating good")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Train variant",
      "Open line",
      "Focus mistakes",
    ]);
  });
});
