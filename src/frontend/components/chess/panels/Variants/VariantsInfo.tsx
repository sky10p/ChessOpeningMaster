import React from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { Box, Typography } from "@mui/material";
import VariantsTree from "./VariantTree";
import { Variant } from "../../models/chess.models";
import { variantsToMoves } from "../../utils/VariantUtils";
import { putRepertoire } from "../../../../repository/repertoires/repertoires";
import { useDialogContext } from "../../../../contexts/DialogContext";

const VariantsInfo: React.FC = () => {
  const { variants, currentMoveNode, orientation, repertoireId, repertoireName, updateRepertoire } =
    useRepertoireContext();
  
    const {showConfirmDialog} = useDialogContext();

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
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Variants
      </Typography>
      <VariantsTree
        variants={variants}
        currentNode={currentMoveNode}
        orientation={orientation}
        deleteVariant={deleteVariant}
      ></VariantsTree>
    </Box>
  );
};

export default VariantsInfo;
