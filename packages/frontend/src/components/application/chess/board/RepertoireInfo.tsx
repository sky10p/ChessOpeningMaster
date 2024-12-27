import React, { useState } from "react";
import { RepertoireInfoPanel } from "../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { Variant } from "../../../../models/chess.models";
import { useRepertoireInfo } from "../../../../hooks/useRepertoireInfo";
import { useMenuContext } from "../../../../contexts/MenuContext";

export const RepertoireInfo = () => {
  const {
    variants,
    currentMoveNode,
    chess,
    changeNameMove,
    goToMove,
    deleteMove,
    comment,
    updateComment,
  } = useRepertoireContext();

  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0]);

  const { toggleMenu } = useMenuContext();

  const { downloadVariantPGN, copyVariantPGN,copyVariantToRepertoire,copyVariantsToRepertoire,deleteVariants, deleteVariant } =
    useRepertoireInfo();

  return (
    <RepertoireInfoPanel
      variants={variants}
      fen={chess.fen()}
      currentMoveNode={currentMoveNode}
      goToMove={goToMove}
      deleteMove={deleteMove}
      changeNameMove={changeNameMove}
      selectedVariant={selectedVariant}
      setSelectedVariant={setSelectedVariant}
      comment={comment}
      updateComment={updateComment}
      copyVariantPGN={copyVariantPGN}
      copyVariantToRepertoire={copyVariantToRepertoire}
      copyVariantsToRepertoire={copyVariantsToRepertoire}
      deleteVariants={deleteVariants}
      downloadVariantPGN={downloadVariantPGN}
      deleteVariant={deleteVariant}
      toggleMenu={toggleMenu}
    />
  );
};
