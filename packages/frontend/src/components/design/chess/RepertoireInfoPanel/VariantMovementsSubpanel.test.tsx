import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MoveVariantNode } from "@chess-opening-master/common";
import { VariantMovementsSubpanel } from "./VariantMovementsSubpanel";

const createMoveNode = (id: string, san: string, color: "w" | "b"): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.move = {
    color,
    piece: "p",
    from: color === "w" ? "e2" : "e7",
    to: color === "w" ? "e4" : "e5",
    san,
    flags: "b",
    lan: color === "w" ? "e2e4" : "e7e5",
    before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  };
  return node;
};

describe("VariantMovementsSubpanel", () => {
  it("should require confirmation before deleting a move", async () => {
    const move = createMoveNode("move-1", "e4", "w");
    const deleteMove = jest.fn();

    render(
      <VariantMovementsSubpanel
        moves={[move]}
        currentMoveNode={move}
        goToMove={jest.fn()}
        deleteMove={deleteMove}
        changeNameMove={jest.fn()}
      />
    );

    fireEvent.contextMenu(screen.getByText("e4"));
    fireEvent.click(screen.getByText("Delete"));

    expect(deleteMove).not.toHaveBeenCalled();
    expect(screen.getByText("Delete move")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(screen.queryByText("Delete move")).not.toBeInTheDocument();
    });

    expect(deleteMove).toHaveBeenCalledTimes(1);
    expect(deleteMove).toHaveBeenCalledWith(move);
  });
});
