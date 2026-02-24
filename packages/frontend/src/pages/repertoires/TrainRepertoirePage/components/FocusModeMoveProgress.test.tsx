import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FocusModeMoveProgress } from "./FocusModeMoveProgress";

describe("FocusModeMoveProgress", () => {
  it("renders recovered status as warning color", () => {
    const { container } = render(
      <FocusModeMoveProgress
        progress={{
          statuses: ["success", "recovered", "failed", "pending"],
          activeIndex: 1,
          mistakeKey: "focus::variant",
        }}
      />
    );

    expect(screen.getByText("Focus progress")).toBeInTheDocument();
    expect(screen.getByText("Step 2/4")).toBeInTheDocument();

    const dots = container.querySelectorAll("span");
    expect(dots).toHaveLength(4);
    expect(dots[0].className).toContain("bg-success");
    expect(dots[1].className).toContain("bg-warning");
    expect(dots[1].className).toContain("ring-2");
    expect(dots[2].className).toContain("bg-danger");
    expect(dots[3].className).toContain("bg-surface-raised");
  });
});
