import React from "react";
import { RepertoireInfoPanel } from "../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { useRepertoireInfo } from "../../../../hooks/useRepertoireInfo";
import { useMenuContext } from "../../../../contexts/MenuContext";
import { useVariantNavigation } from "../../../../hooks/useVariantNavigation";

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
    selectedVariant,
    repertoireId,
  } = useRepertoireContext();

  const { toggleMenu } = useMenuContext();
  const { handleVariantChange } = useVariantNavigation();

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
      selectedVariant={selectedVariant || variants[0]}
      setSelectedVariant={handleVariantChange}
      comment={comment}
      updateComment={updateComment}
      copyVariantPGN={copyVariantPGN}
      copyVariantToRepertoire={copyVariantToRepertoire}
      copyVariantsToRepertoire={copyVariantsToRepertoire}
      deleteVariants={deleteVariants}
      downloadVariantPGN={downloadVariantPGN}
      deleteVariant={deleteVariant}
      repertoireId={repertoireId}
      toggleMenu={toggleMenu}
    />
  );
};
