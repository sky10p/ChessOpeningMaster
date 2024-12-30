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
    <div className="w-1/2 h-1/2 bg-background">
      <RepertoireInfoPanel
        repertoireId="1"
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        currentMoveNode={currentMoveNode}
        goToMove={(move) => setCurrentMoveNode(move)}
        deleteMove={() => console.log("Delete move")}
        changeNameMove={() => {
          console.log("Change name move");
        }}
        selectedVariant={variantMoves[0]}
        setSelectedVariant={() => console.log("Set selected variant")}
        variants={variantMoves}
        comment={comment}
        updateComment={setComment}
        copyVariantPGN={() => console.log("Copy variant PGN")}
        deleteVariant={() => console.log("Delete variant")}
        downloadVariantPGN={() => console.log("Download variant PGN")}
        copyVariantToRepertoire={() => console.log("Copy variant to repertoire")}
        copyVariantsToRepertoire={() => console.log("Copy variants to repertoire")}
        deleteVariants={() => console.log("Delete variants")} 
        toggleMenu={() => console.log("Toggle menu")}
      />
    </div>
  );
};
