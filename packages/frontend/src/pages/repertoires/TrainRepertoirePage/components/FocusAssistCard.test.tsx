import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FocusAssistCard } from "./FocusAssistCard";

jest.mock("../../../../components/design/chess/train/HintInfo", () => ({
  HintInfo: () => <div data-testid="assist-comments">comments</div>,
}));

jest.mock("../../../../components/design/chess/train/TrainAvailableVariantsPanel", () => ({
  TrainAvailableVariantsPanel: () => <div data-testid="assist-variants">variants</div>,
}));

const baseProps = {
  hasErrors: false,
  pendingErrorCount: 0,
  currentMoveNode: { id: "root", position: 0 } as any,
  orientation: "white" as const,
  updateComment: jest.fn(async () => undefined),
  trainVariants: [],
  onHintReveal: jest.fn(),
};

describe("FocusAssistCard", () => {
  it("shows waiting message when there are no errors", () => {
    render(<FocusAssistCard {...baseProps} />);

    expect(
      screen.getByText(
        "It activates after your first mistake."
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId("assist-comments")).not.toBeInTheDocument();
  });

  it("shows comments by default when errors exist", () => {
    render(
      <FocusAssistCard
        {...baseProps}
        hasErrors={true}
        pendingErrorCount={2}
      />
    );

    expect(screen.getByTestId("assist-comments")).toBeInTheDocument();
    expect(screen.queryByTestId("assist-variants")).not.toBeInTheDocument();
    expect(screen.getByText("2 pending")).toBeInTheDocument();
  });

  it("switches to candidate variants tab", () => {
    render(
      <FocusAssistCard
        {...baseProps}
        hasErrors={true}
        pendingErrorCount={1}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Candidate lines" }));

    expect(screen.getByTestId("assist-variants")).toBeInTheDocument();
  });
});
