import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RepertoireWorkspaceLayout } from "./RepertoireWorkspaceLayout";

describe("RepertoireWorkspaceLayout", () => {
  it("renders title, board, board actions, mobile panel and desktop panel", () => {
    const { container } = render(
      <RepertoireWorkspaceLayout
        title="My Repertoire"
        board={<div data-testid="board">Board</div>}
        boardActions={<div data-testid="board-actions">Actions</div>}
        mobilePanel={<div data-testid="mobile-panel">Mobile panel</div>}
        desktopPanel={<div data-testid="desktop-panel">Desktop panel</div>}
      />
    );

    expect(screen.getByText("My Repertoire")).toBeInTheDocument();
    expect(screen.getByTestId("board")).toBeInTheDocument();
    expect(screen.getByTestId("board-actions")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-panel")).toBeInTheDocument();
    expect(screen.getByTestId("desktop-panel")).toBeInTheDocument();

    expect(container.firstChild).toHaveClass(
      "grid",
      "grid-cols-1",
      "sm:grid-cols-12",
      "gap-4",
      "h-full",
      "w-full",
      "bg-background",
      "text-textLight"
    );
  });

  it("does not render board actions section when boardActions is not provided", () => {
    render(
      <RepertoireWorkspaceLayout
        title="My Repertoire"
        board={<div data-testid="board">Board</div>}
        mobilePanel={<div data-testid="mobile-panel">Mobile panel</div>}
        desktopPanel={<div data-testid="desktop-panel">Desktop panel</div>}
      />
    );

    expect(screen.queryByTestId("board-actions")).not.toBeInTheDocument();
  });
});
