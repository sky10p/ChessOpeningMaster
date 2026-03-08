import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Drawer } from "./Drawer";
import { Button } from "./Button";

describe("Drawer", () => {
  const renderDrawer = () =>
    render(
      <Drawer
        open
        title="Drawer title"
        onClose={jest.fn()}
        footer={
          <Button type="button" intent="secondary" size="sm">
            Footer action
          </Button>
        }
      >
        <Button type="button" intent="secondary" size="sm">
          First action
        </Button>
      </Drawer>
    );

  it("focuses the first focusable control when opened", () => {
    renderDrawer();

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("keeps Shift+Tab on the drawer container inside the focus trap", () => {
    renderDrawer();

    const dialog = screen.getByRole("dialog");
    const footerAction = screen.getByRole("button", { name: "Footer action" });

    dialog.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    expect(footerAction).toHaveFocus();
  });
});
