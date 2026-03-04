import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the tooltip content in a portal on hover", async () => {
    render(
      <Tooltip content={<span>Helpful copy</span>}>
        <span>Trigger</span>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Trigger"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Helpful copy");
  });

  it("closes on blur, mouse leave, and Escape", async () => {
    render(
      <Tooltip content={<span>Helpful copy</span>}>
        <span>Trigger</span>
      </Tooltip>
    );

    const trigger = screen.getByText("Trigger");

    fireEvent.focus(trigger);
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    fireEvent.mouseEnter(trigger);
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
