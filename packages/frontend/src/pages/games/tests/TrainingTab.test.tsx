import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import TrainingTab from "../tabs/TrainingTab";

describe("TrainingTab", () => {
  it("marks item done when checkbox is toggled", () => {
    const markDone = jest.fn().mockResolvedValue(undefined);

    render(
      <TrainingTab
        trainingPlanId="plan-1"
        actionableTrainingItems={[
          {
            lineKey: "line-1",
            openingName: "Sicilian Defense",
            variantName: "Najdorf",
            repertoireName: "Main",
            movesSan: ["e4", "c5"],
            priority: 0.9,
            reasons: ["test"],
            effort: "high",
            tasks: ["task"],
            games: 10,
            wins: 4,
            draws: 2,
            losses: 4,
            mappedGames: 10,
            manualReviewGames: 0,
            deviationRate: 0.1,
            trainingErrors: 2,
            done: false,
          },
        ]}
        signalLines={[]}
        trainingItemsWithErrors={1}
        highPriorityTrainingItems={1}
        offBookSignalCount={0}
        openingTargetFromLine={() => null}
        openRepertoire={jest.fn()}
        openTrainRepertoire={jest.fn()}
        markDone={markDone}
      />
    );

    fireEvent.click(screen.getByRole("checkbox"));

    expect(markDone).toHaveBeenCalledWith("plan-1", "line-1", true);
  });
});
