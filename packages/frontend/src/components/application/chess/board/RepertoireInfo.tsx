import React, { useState } from "react";
import { RepertoireInfoPanel } from "../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { Variant } from "../../../../models/chess.models";
import { useRepertoireInfo } from "../../../../hooks/useRepertoireInfo";
import { useMenuContext } from "../../../../contexts/MenuContext";
import { useLocation } from "react-router-dom";

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

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const variantNameParam = params.get("variantName");
  const pathVariant = variants.find(
    (variant) => variant.name === variantNameParam || variant.fullName === variantNameParam
  );
  const defaultVariant = pathVariant ?? variants[0];

  const [selectedVariant, setSelectedVariant] = useState<Variant>(defaultVariant);

  const { toggleMenu } = useMenuContext();
  const { repertoireId } = useRepertoireContext();

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
      defaultVariant={defaultVariant}
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
      repertoireId={repertoireId}
      toggleMenu={toggleMenu}
    />
  );
};
