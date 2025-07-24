import React from "react";
import { RepertoireInfoPanel } from "../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
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
    selectedVariant,
    setSelectedVariant,
    repertoireId,
  } = useRepertoireContext();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const variantNameParam = params.get("variantName");
  const pathVariant = variants.find(
    (variant) => variant.name === variantNameParam || variant.fullName === variantNameParam
  );
  const defaultVariant = pathVariant ?? variants[0];

  React.useEffect(() => {
    if (!selectedVariant && defaultVariant) {
      setSelectedVariant(defaultVariant);
    }
  }, [selectedVariant, defaultVariant, setSelectedVariant]);

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
      selectedVariant={selectedVariant || defaultVariant}
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
