import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RepertoireInfoPanel } from "../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { useRepertoireInfo } from "../../../../hooks/useRepertoireInfo";
import { useMenuContext } from "../../../../contexts/MenuContext";
import { Variant } from "../../../../models/chess.models";

export const RepertoireInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    initBoard,
  } = useRepertoireContext();

  const { toggleMenu } = useMenuContext();

  const handleVariantChange = (variant: Variant | null) => {
    setSelectedVariant(variant);
    initBoard();
    
    const currentParams = new URLSearchParams(location.search);
    if (variant?.fullName) {
      currentParams.set("variantName", variant.fullName);
    } else {
      currentParams.delete("variantName");
    }
    
    const newUrl = `${location.pathname}?${currentParams.toString()}`;
    navigate(newUrl, { replace: true });
  };

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
