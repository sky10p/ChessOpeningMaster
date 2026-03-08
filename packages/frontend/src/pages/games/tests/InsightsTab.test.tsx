import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import InsightsTab from "../tabs/InsightsTab";

jest.mock("recharts", () => {
  const React = require("react");
  const actual = jest.requireActual("recharts");

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 800, height: 224 }),
  };
});

jest.mock("../../../hooks/useChartColors", () => ({
  useChartColors: () => ({ tickFill: "#bfd0e6" }),
}));

describe("InsightsTab", () => {
  it("renders the games by month section with the updated month chart props", () => {
    render(
      <InsightsTab
        stats={{
          totalGames: 12,
          wins: 6,
          draws: 2,
          losses: 4,
          winRate: 0.5,
          bySource: [],
          mappedToRepertoireCount: 8,
          needsManualReviewCount: 2,
          uniqueLines: 5,
          openingPerformance: [],
          variantPerformance: [],
          gamesByMonth: [],
          unmappedOpenings: [],
          unusedRepertoires: [],
          topOpenings: [],
          linesToStudy: [],
        }}
        mappedRatio={0.67}
        manualReviewRatio={0.17}
        wdl={{ win: 0.5, draw: 0.17, loss: 0.33 }}
        gamesByMonth={[
          { month: "2025-08", games: 12 },
          { month: "2025-09", games: 18 },
        ]}
        variantPerformance={[]}
        weakestVariants={[]}
        strongestVariants={[]}
        offBookOpenings={[]}
        trainingIdeas={[]}
        openRepertoire={jest.fn()}
        openTrainRepertoire={jest.fn()}
      />
    );

    expect(screen.getByText("Games By Month")).toBeInTheDocument();
    expect(screen.getByText("Aug")).toBeInTheDocument();
    expect(screen.getByText("Sep")).toBeInTheDocument();
  });
});
