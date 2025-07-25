import React from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import VariantsTree from "../../../design/chess/VariantTree/VariantTree";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { useAlertContext } from "../../../../contexts/AlertContext";
import { useRepertoireInfo } from "../../../../hooks/useRepertoireInfo";
import { useVariantNavigation } from "../../../../hooks/useVariantNavigation";

const VariantsInfo: React.FC = () => {
  const {
    variants,
    repertoireId,
    currentMoveNode,
    orientation,
    changeNameMove,
    goToMove,
    deleteMove,
    selectedVariant,
  } = useRepertoireContext();

  const { handleVariantChange } = useVariantNavigation();

  useDialogContext();
  useAlertContext();

 const {deleteVariant, copyVariantToRepertoire, copyVariantsToRepertoire, deleteVariants, copyVariantPGN,downloadVariantPGN} = useRepertoireInfo();

  return (

      <VariantsTree
        variants={variants}
        repertoireId={repertoireId}
        orientation={orientation}
        deleteVariant={deleteVariant}
        copyVariantToRepertoire={copyVariantToRepertoire}
        copyVariantsToRepertoire={copyVariantsToRepertoire}
        copyVariantPGN={copyVariantPGN}
        downloadVariantPGN={downloadVariantPGN}
        deleteVariants={deleteVariants}
        changeNameMove={changeNameMove}
        deleteMove={deleteMove}
        goToMove={goToMove}
        currentMoveNode={currentMoveNode}
        selectedVariant={selectedVariant}
        setSelectedVariant={handleVariantChange}
      ></VariantsTree>

  );
};

export default VariantsInfo;
