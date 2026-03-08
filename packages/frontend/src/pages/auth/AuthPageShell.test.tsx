import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthPageShell from "./AuthPageShell";

describe("AuthPageShell", () => {
  it("keeps a single page-level heading", () => {
    const { container } = render(
      <AuthPageShell
        title="Sign in"
        description="Access your opening library."
        asideTitle="Train with one coherent opening workspace."
        asideDescription="Keep your lessons and studies in one flow."
      >
        <div>Form content</div>
      </AuthPageShell>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Train with one coherent opening workspace." })).toBeInTheDocument();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });
});
