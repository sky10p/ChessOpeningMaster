import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RepertoireOverviewBadge, getOverviewState } from "./RepertoireOverviewBadge";

describe("RepertoireOverviewBadge", () => {
  it("shows tooltip content on hover", async () => {
    render(
      <RepertoireOverviewBadge
        variant="warning"
        size="sm"
        label="Needs Work"
        tooltip={<span>Badge explanation</span>}
      />
    );

    fireEvent.mouseEnter(screen.getByText("Needs Work").parentElement as HTMLElement);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Badge explanation");
  });

  it("derives the correct overview states", () => {
    expect(
      getOverviewState(
        {
          total: 2,
          noErrors: 0,
          oneError: 1,
          twoErrors: 0,
          moreThanTwoErrors: 0,
          unresolved: 1,
        },
        0
      ).label
    ).toBe("Needs Work");
    expect(
      getOverviewState(
        {
          total: 1,
          noErrors: 0,
          oneError: 0,
          twoErrors: 0,
          moreThanTwoErrors: 0,
          unresolved: 1,
        },
        0
      ).label
    ).toBe("New");
    expect(
      getOverviewState(
        {
          total: 1,
          noErrors: 1,
          oneError: 0,
          twoErrors: 0,
          moreThanTwoErrors: 0,
          unresolved: 0,
        },
        0
      ).label
    ).toBe("Ready");
  });
});
