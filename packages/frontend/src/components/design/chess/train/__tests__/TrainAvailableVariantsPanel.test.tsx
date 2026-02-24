import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TrainAvailableVariantsPanel } from "../TrainAvailableVariantsPanel";
import { MoveVariantNode } from "../../../../../models/VariantNode";
import { TrainVariant } from "../../../../../models/chess.models";

jest.mock("../../../../../utils/chess/variants/getMovementsFromVariants", () => ({
  getMovementsFromVariant: jest.fn(() => ["e4", "e5", "Nf3"]),
}));

const createMoveNode = (id: string, position = 0): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.position = position;
  return node;
};

describe("TrainAvailableVariantsPanel", () => {
  const onHintReveal = jest.fn();
  const currentMoveNode = createMoveNode("root");
  const trainVariants: TrainVariant[] = [
    {
      state: "inProgress",
      variant: {
        fullName: "Spanish: Main",
        name: "Spanish: Main",
        moves: [createMoveNode("e2e4", 1)],
        differentMoves: "",
      },
    },
  ];

  it("shows locked message when assist disabled", () => {
    render(
      <TrainAvailableVariantsPanel
        trainVariants={trainVariants}
        currentMoveNode={currentMoveNode}
        onHintReveal={onHintReveal}
        assistEnabled={false}
      />
    );

    expect(
      screen.getByText("La ayuda se desbloquea tras el primer error en focus.")
    ).toBeInTheDocument();
  });

  it("reveals candidate moves and counts hint", () => {
    render(
      <TrainAvailableVariantsPanel
        trainVariants={trainVariants}
        currentMoveNode={currentMoveNode}
        onHintReveal={onHintReveal}
      />
    );

    fireEvent.click(screen.getByText("Spanish: Main"));
    expect(onHintReveal).toHaveBeenCalledTimes(1);
    expect(screen.getByText("e4")).toBeInTheDocument();
  });
});
