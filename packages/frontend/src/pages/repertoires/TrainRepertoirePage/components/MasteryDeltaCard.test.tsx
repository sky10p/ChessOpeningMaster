import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MasteryDeltaCard } from "./MasteryDeltaCard";

describe("MasteryDeltaCard", () => {
  it("shows improved mastery with clear point delta", () => {
    render(<MasteryDeltaCard before={49} after={57} />);

    expect(screen.getByText("Mastery Impact")).toBeInTheDocument();
    expect(screen.getByText("Mastery improved by 8 points")).toBeInTheDocument();
    expect(screen.getByText("Before 49% • Now 57%")).toBeInTheDocument();
    expect(screen.getByText("+8 pts")).toBeInTheDocument();
  });

  it("shows decreased mastery with clear point delta", () => {
    render(<MasteryDeltaCard before={49} after={47} />);

    expect(screen.getByText("Mastery dropped by 2 points")).toBeInTheDocument();
    expect(screen.getByText("-2 pts")).toBeInTheDocument();
  });
});
