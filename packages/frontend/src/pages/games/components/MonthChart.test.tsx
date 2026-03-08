import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import MonthChart from "./MonthChart";

jest.mock("../../../hooks/useChartColors", () => ({
  useChartColors: () => ({ tickFill: "#bfd0e6" }),
}));

jest.mock("recharts", () => {
  const React = require("react");
  const actual = jest.requireActual("recharts");

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 800, height: 224 }),
  };
});

describe("MonthChart", () => {
  it("renders an empty state when there is no monthly data", () => {
    render(<MonthChart gamesByMonth={[]} />);

    expect(screen.getByText("No data for current filters.")).toBeInTheDocument();
  });

  it("renders the monthly chart with formatted labels and totals", () => {
    const { container } = render(
      <MonthChart
        gamesByMonth={[
          { month: "2025-08", games: 12 },
          { month: "2025-09", games: 18 },
          { month: "2026-01", games: 198 },
        ]}
      />
    );

    expect(container.querySelector(".recharts-wrapper")).toBeInTheDocument();
    expect(screen.getByText("Aug")).toBeInTheDocument();
    expect(screen.getByText("Sep")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getAllByText("'25").length).toBeGreaterThan(0);
    expect(screen.getByText("'26")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getAllByText("198").length).toBeGreaterThan(0);
  });
});
