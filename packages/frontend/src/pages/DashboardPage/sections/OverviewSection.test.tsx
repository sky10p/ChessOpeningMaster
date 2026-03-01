import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OverviewSection } from "./OverviewSection";
import { IRepertoireDashboard } from "@chess-opening-master/common";

jest.mock("../../../utils/navigationUtils", () => ({
  useNavigationUtils: () => ({
    goToTrainRepertoire: jest.fn(),
    goToTrainRepertoireWithVariants: jest.fn(),
  }),
}));

describe("OverviewSection", () => {
  it("updates the selected tab when initialView changes", async () => {
    const repertoires: IRepertoireDashboard[] = [];
    const { rerender } = render(
      <OverviewSection repertoires={repertoires} initialView="errors" />
    );

    expect(screen.getByRole("tab", { name: /errors/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    rerender(
      <OverviewSection repertoires={repertoires} initialView="unreviewed" />
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /unreviewed/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });
});
