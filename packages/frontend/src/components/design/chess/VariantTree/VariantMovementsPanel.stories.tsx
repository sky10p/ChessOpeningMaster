import { Story } from "@ladle/react";
import { VariantMovementsPanel } from "./VariantMovementsPanel";
import React, { useMemo, useState } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { testRepertoireMock } from "../../../../utils/chess/pgn/tests/mocks/repertoire-with-variants.mock";
import { testRepertoireWithSubvariantsMock } from "../../../../utils/chess/pgn/tests/mocks/repertoire-with-subvariants.mock";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../../../../design/theme";

export const VariantMovementsPanelWithVariantsStory: Story = () => {

  const variantMoves = useMemo(() => {
    const move = MoveVariantNode.initMoveVariantNode(testRepertoireMock);
    return move.getVariants();
  }, []);
  const moveFromVariant = variantMoves[0].moves;
  const [currentMoveNode, setCurrentMoveNode] = useState(
    moveFromVariant[0]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VariantMovementsPanel
        moves={moveFromVariant}
        currentMoveNode={currentMoveNode}
        goToMove={(move) => setCurrentMoveNode(move)}
        deleteMove={(move) => console.log(`Delete move: ${move}`)}
        changeNameMove={() => {
          console.log("Change name move");
        }}
      />
    </ThemeProvider>
  );
};

export const VariantMovementsPanelWithVariantsWithMoreHeightStory: Story =
  () => {
    const variantMoves = useMemo(() => {
      const move = MoveVariantNode.initMoveVariantNode(
        testRepertoireWithSubvariantsMock
      );
      return move.getVariants();
    }, []);
    const moveFromVariant = variantMoves[3].moves;
    const [currentMoveNode, setCurrentMoveNode] = useState(
      moveFromVariant[0]
    );
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
      </ThemeProvider>
    );
  };
