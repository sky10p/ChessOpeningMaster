import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VariantsProgressBar } from "./VariantsProgressBar";

describe("VariantsProgressBar", () => {
  it("renders counts mode without requiring variant data", () => {
    const { container } = render(
      <VariantsProgressBar
        counts={{
          noErrors: 2,
          oneError: 1,
          twoErrors: 1,
          moreThanTwoErrors: 0,
          unresolved: 1,
        }}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(3);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("supports tight spacing and zero-total fallback", () => {
    const { container } = render(
      <VariantsProgressBar
        counts={{
          noErrors: 0,
          oneError: 0,
          twoErrors: 0,
          moreThanTwoErrors: 0,
          unresolved: 0,
        }}
        spacing="tight"
      />
    );

    expect(container.firstChild).toHaveStyle({ margin: "2px 0 0" });
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
