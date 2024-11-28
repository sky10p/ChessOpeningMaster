import React from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { Box } from "@mui/material";
import VariantsTree from "./VariantTree";
import { Variant } from "../../models/chess.models";
import { variantsToMoves } from "../../utils/VariantUtils";
import {
  getRepertoire,
  getRepertoires,
  putRepertoire,
} from "../../../../repository/repertoires/repertoires";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { MoveVariantNode } from "../../utils/VariantNode";
import { IRepertoire } from "../../../../../common/types/Repertoire";
import { useAlertContext } from "../../../../contexts/AlertContext";

const VariantsInfo: React.FC = () => {
  const {
    variants,
    currentMoveNode,
    orientation,
    repertoireId,
    repertoireName,
    updateRepertoire,
  } = useRepertoireContext();

  const { showConfirmDialog, showRepertoireDialog, showSelectVariantsDialog } =
    useDialogContext();
  const { showAlert } = useAlertContext();

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
          repertoireId,
          repertoireName,
          movesWithoutVariant.getMoveNodeWithoutParent(),
          orientation
        );
        updateRepertoire();
      },
    });
  };

  const copyVariantToRepertoire = async (variant: Variant) => {
    const repertoires: IRepertoire[] = await getRepertoires();
    showRepertoireDialog({
      title: "Copy variant",
      contentText: `Select the repertoire to copy the variant ${variant.fullName}:`,
      repertoires,
      onConfirm: async (selectedRepertoire) => {
        const repertoire = await getRepertoire(selectedRepertoire._id);
        const variants = repertoire.moveNodes
          ? MoveVariantNode.initMoveVariantNode(
              repertoire.moveNodes
            ).getVariants()
          : [];
        const newVariants = [...variants, variant];
        const moves = variantsToMoves(newVariants);
        await putRepertoire(
          repertoire._id,
          repertoire.name,
          moves.getMoveNodeWithoutParent(),
          repertoire.orientation
        );
        updateRepertoire();
        showAlert(
          `Variant ${variant.fullName} copied to ${selectedRepertoire.name}`,
          "success"
        );
      },
    });
  };

  const copyVariantsToRepertoire = async () => {
    const repertoires: IRepertoire[] = await getRepertoires();
    let selectedVariantsToCopy: Variant[] = [];
    showSelectVariantsDialog({
      title: "Copy variants",
      contentText: "Select the variants to copy:",
      variants,
      onVariantsConfirm: async (selectedVariants) => {
        selectedVariantsToCopy = selectedVariants;
      },
      onDialogClose: async () => {
        showRepertoireDialog({
          title: "Copy variants",
          contentText: `Select the repertoire to copy the variants:`,
          repertoires,
          onConfirm: async (selectedRepertoire) => {
            const repertoire = await getRepertoire(selectedRepertoire._id);
            const variants = repertoire.moveNodes
              ? MoveVariantNode.initMoveVariantNode(
                  repertoire.moveNodes
                ).getVariants()
              : [];
            const newVariants = [...variants, ...selectedVariantsToCopy];
            const moves = variantsToMoves(newVariants);
            await putRepertoire(
              repertoire._id,
              repertoire.name,
              moves.getMoveNodeWithoutParent(),
              repertoire.orientation
            );
            updateRepertoire();
            showAlert(
              `Variants copied to ${selectedRepertoire.name}`,
              "success"
            );
          },
        });
      },
    });
  };

  const deleteVariants = async () => {
    let selectedVariantsToDelete: Variant[] = [];
    showSelectVariantsDialog({
      title: "Delete variants",
      contentText: "Select the variants to delete:",
      variants,
      onVariantsConfirm: async (selectedVariants) => {
        selectedVariantsToDelete = selectedVariants;
        
      },
      onDialogClose: async () => {
        showConfirmDialog({
          title: "Delete variants",
          contentText: "Are you sure you want to delete the selected variants?",
          onConfirm: async () => {
            const variantsWithoutDeleted = variants.filter(
              (v) =>
                !selectedVariantsToDelete.some(
                  (variant) => variant.fullName === v.fullName
                )
            );
            const movesWithoutVariant = variantsToMoves(variantsWithoutDeleted);
            await putRepertoire(
              repertoireId,
              repertoireName,
              movesWithoutVariant.getMoveNodeWithoutParent(),
              orientation
            );
            updateRepertoire();
          },
        });
      }
    });
  };

  return (
    <Box>
      <VariantsTree
        variants={variants}
        currentNode={currentMoveNode}
        orientation={orientation}
        deleteVariant={deleteVariant}
        copyVariantToRepertoire={copyVariantToRepertoire}
        copyVariantsToRepertoire={copyVariantsToRepertoire}
        deleteVariants={deleteVariants}
      ></VariantsTree>
    </Box>
  );
};

export default VariantsInfo;
