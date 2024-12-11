import { Story } from "@ladle/react";
import { VariantMovementsPanel } from "./VariantMovementsPanel";
import React from "react";
import { MoveVariantNode } from "../../../../../models/VariantNode";
import { testRepertoireMock } from "../../../../../utils/chess/pgn/tests/mocks/repertoire-with-variants.mock";
import { testRepertoireWithSubvariantsMock } from "../../../../../utils/chess/pgn/tests/mocks/repertoire-with-subvariants.mock";

export const VariantMovementsPanelWithVariantsStory: Story = () => {
  const move = MoveVariantNode.initMoveVariantNode(testRepertoireMock);
  const variantMoves = move.getVariants();
  const moveFromVariant = variantMoves[0].moves;
  const [currentMoveNode, setCurrentMoveNode] = React.useState(
    moveFromVariant[0]
  );
  return (
    <VariantMovementsPanel
      moves={moveFromVariant}
      currentMoveNode={currentMoveNode}
      goToMove={(move) => setCurrentMoveNode(move)}
      deleteMove={(move) => console.log(`Delete move: ${move}`)}
      changeNameMove={() => {
        console.log("Change name move");
      }}
    />
  );
};

export const VariantMovementsPanelWithVariantsWithMoreHeightStory: Story =
  () => {
    const move = MoveVariantNode.initMoveVariantNode(
      testRepertoireWithSubvariantsMock
    );
    const variantMoves = move.getVariants();
    const moveFromVariant = variantMoves[3].moves;
    const [currentMoveNode, setCurrentMoveNode] = React.useState(
      moveFromVariant[0]
    );
    return (
      <VariantMovementsPanel
        moves={moveFromVariant}
        currentMoveNode={currentMoveNode}
        maxHeight="250px"
        goToMove={(move) => setCurrentMoveNode(move)}
        deleteMove={() => console.log("Delete move")}
        changeNameMove={() => {
          console.log("Change name move");
        }}
      />
    );
  };
