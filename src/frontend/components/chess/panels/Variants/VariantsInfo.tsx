import React from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { Box, Typography } from "@mui/material";
import VariantsTree from "./VariantTree";
import { Variant } from "../../models/chess.models";
import { variantsToMoves } from "../../utils/VariantUtils";
import { getRepertoire, getRepertoires, putRepertoire } from "../../../../repository/repertoires/repertoires";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { MoveVariantNode } from "../../utils/VariantNode";
import { IRepertoire } from "../../../../../common/types/Repertoire";
import { useAlertContext } from "../../../../contexts/AlertContext";

const VariantsInfo: React.FC = () => {
  const { variants, currentMoveNode, orientation, repertoireId, repertoireName, updateRepertoire } =
    useRepertoireContext();
  
  const { showConfirmDialog, showRepertoireDialog } = useDialogContext();
  const {showAlert} = useAlertContext();

  const deleteVariant = async (variant: Variant) => {
    showConfirmDialog({
      title: "Delete variant",
      contentText: "Are you sure you want to delete this variant?",
      onConfirm: async () => {
        const variantsWithoutDeleted = variants.filter(
          (v) => v.fullName !== variant.fullName
        );
        const movesWithoutVariant = variantsToMoves(variantsWithoutDeleted);
        await putRepertoire(
          repertoireId, repertoireName, movesWithoutVariant.getMoveNodeWithoutParent(), orientation
        )
        updateRepertoire();
      }
    });
  }

  const copyVariantToRepertoire = async (variant: Variant) => {
    const repertoires: IRepertoire[] = await getRepertoires();
    showRepertoireDialog({
      title: "Copy variant",
      contentText: `Select the repertoire to copy the variant ${variant.fullName}:`,
      repertoires,
      onConfirm: async (selectedRepertoire) => {
        const repertoire = await getRepertoire(selectedRepertoire._id);
        const variants = repertoire.moveNodes ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes).getVariants() : [];
        const newVariants = [...variants, variant];
        const moves = variantsToMoves(newVariants);
        await putRepertoire(repertoire._id, repertoire.name, moves.getMoveNodeWithoutParent(), repertoire.orientation);
        updateRepertoire();
        showAlert(`Variant ${variant.fullName} copied to ${selectedRepertoire.name}`, "success");
      }
    });
  }

  return (
    <Box>
      <VariantsTree
        variants={variants}
        currentNode={currentMoveNode}
        orientation={orientation}
        deleteVariant={deleteVariant}
        copyVariantToRepertoire={copyVariantToRepertoire}
      ></VariantsTree>
    </Box>
  );
};

export default VariantsInfo;
