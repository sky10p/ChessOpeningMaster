import React, { useMemo, useState } from "react";
import { Story } from "@ladle/react";
import { RepertoireInfoPanel } from "./RepertoireInfoPanel";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { testRepertoireWithSubvariantsMock } from "../../../../utils/chess/pgn/tests/mocks/repertoire-with-subvariants.mock";

export const RepertoireInfoPanelStory: Story = () => {
    const [comment, setComment] = useState("");
  const variantMoves = useMemo(() => {
    const move = MoveVariantNode.initMoveVariantNode(
      testRepertoireWithSubvariantsMock
    );
    return move.getVariants();
  }, []);
  const moveFromVariant = variantMoves[3].moves;
  const [currentMoveNode, setCurrentMoveNode] = useState(moveFromVariant[0]);

  return (
    <RepertoireInfoPanel
      fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      currentMoveNode={currentMoveNode}
      goToMove={(move) => setCurrentMoveNode(move)}
      deleteMove={() => console.log("Delete move")}
      changeNameMove={() => {
        console.log("Change name move");
      }}
      onSelectVariant={() => console.log("Select variant")}
      variants={variantMoves}
        comment={comment}
        updateComment={setComment}
    />
  );
};
