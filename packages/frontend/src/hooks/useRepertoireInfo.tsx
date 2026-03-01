import { IRepertoire } from "@chess-opening-master/common";
import { Variant } from "../models/chess.models";
import {
  getRepertoire,
  getRepertoires,
  putRepertoire,
} from "../repository/repertoires/repertoires";
import { variantsToMoves } from "../utils/chess/variants/VariantUtils";
import { MoveVariantNode } from "../models/VariantNode";
import { useAlertContext } from "../contexts/AlertContext";
import { useRepertoireContext } from "../contexts/RepertoireContext";
import { useDialogContext } from "../contexts/DialogContext";
import { variantToPgn } from "../utils/chess/pgn/pgn.utils";

export const useRepertoireInfo = () => {
  const {
    variants,
    orientation,
    repertoireId,
    repertoireName,
    updateRepertoire,
  } = useRepertoireContext();
  const { showConfirmDialog, showRepertoireDialog, showSelectVariantsDialog } = useDialogContext();
  const { showAlert } = useAlertContext();
  const downloadVariantPGN = async (variant: Variant) => {
    if (variant) {
      const pgn = await variantToPgn(variant, orientation, new Date());
      const blob = new Blob([pgn], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${variant.name}.pgn`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyVariantPGN = async (variant: Variant) => {
    if (variant) {
      const pgn = await variantToPgn(variant, orientation, new Date());
      const textarea = document.createElement("textarea");
      textarea.value = pgn;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Unable to copy text", err);
      }
      document.body.removeChild(textarea);
    } else {
      console.error("No variant selected");
    }
  };

  const deleteVariant = async (variant: Variant) => {
    showConfirmDialog({
      title: "Delete variant",
      contentText: "Are you sure you want to delete this variant?",
      confirmLabel: "Delete",
      confirmIntent: "danger",
      onConfirm: async () => {
        const variantsWithoutDeleted = variants.filter(
          (v: Variant) => v.fullName !== variant.fullName
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
        onDialogClose: async (isCancelled: boolean) => {
          !isCancelled && showRepertoireDialog({
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
          onDialogClose: async (isCancelled: boolean) => {
            !isCancelled && showConfirmDialog({
              title: "Delete variants",
              contentText: "Are you sure you want to delete the selected variants?",
              confirmLabel: "Delete",
              confirmIntent: "danger",
              onConfirm: async () => {
                const variantsWithoutDeleted = variants.filter(
                  (v: Variant) =>
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



  return {
    downloadVariantPGN,
    copyVariantPGN,
    deleteVariant,
    copyVariantToRepertoire,
    copyVariantsToRepertoire,
    deleteVariants,
  };
};
