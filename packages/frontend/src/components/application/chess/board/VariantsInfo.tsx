import React from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import VariantsTree from "../../../design/chess/VariantTree/VariantTree";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { useAlertContext } from "../../../../contexts/AlertContext";
import { useRepertoireInfo } from "../../../../hooks/useRepertoireInfo";

const VariantsInfo: React.FC = () => {
  const {
    variants,
    repertoireId,
    currentMoveNode,
    orientation,
    changeNameMove,
    goToMove,
    deleteMove,
  } = useRepertoireContext();

  useDialogContext();
  useAlertContext();

 const {deleteVariant, copyVariantToRepertoire, copyVariantsToRepertoire, deleteVariants, copyVariantPGN,downloadVariantPGN} = useRepertoireInfo();

  return (

      <VariantsTree
        variants={variants}
        repertoireId={repertoireId}
        currentNode={currentMoveNode}
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
      ></VariantsTree>

  );
};

export default VariantsInfo;
