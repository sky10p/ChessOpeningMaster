import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid } from "@mui/material";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Variant } from "../../../../models/chess.models";
import { SelectVariant } from "../../SelectVariant";
import { variantToPgn } from "../../../../utils/chess/pgn/pgn.utils";
import { BoardOrientation } from "../../../../../common/types/Orientation";
import { VariantMovementsPanel } from "./VariantMovementsPanel";
import VariantActionButtons from "./VariantActionButtons";

import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { DeleteSweep, ContentPaste } from "@mui/icons-material";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
  orientation: BoardOrientation;
  deleteVariant: (variant: Variant) => void;
  copyVariantToRepertoire: (variant: Variant) => void;
  deleteVariants: () => void;
  copyVariantsToRepertoire: () => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
  deleteMove: (move: MoveVariantNode) => void;
  goToMove: (move: MoveVariantNode) => void;
  currentMoveNode: MoveVariantNode;
}

const VariantTree: React.FC<VariantTreeProps> = ({
  variants,
  currentNode,
  orientation,
  deleteVariant,
  copyVariantToRepertoire,
  copyVariantsToRepertoire,
  deleteVariants,
  changeNameMove,
  deleteMove,
  goToMove,
  currentMoveNode,
}) => {
  const isSelected = (node: MoveVariantNode) => node === currentNode;
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    variants[0]
  );
  useEffect(() => {
    setSelectedVariant(
      variants.find((variant) =>
        variant.moves.some((move) => isSelected(move))
      ) ?? variants[0]
    );
  }, [variants]);

  const downloadVariantPGN = () => {
    if (selectedVariant) {
      const pgn = variantToPgn(selectedVariant, orientation, new Date());
      const blob = new Blob([pgn], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedVariant.name}.pgn`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyVariantPGN = () => {
    if (selectedVariant) {
      const pgn = variantToPgn(selectedVariant, orientation, new Date());
      const textarea = document.createElement("textarea");
      textarea.value = pgn;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        console.log("Text copied to clipboard");
      } catch (err) {
        console.error("Unable to copy text", err);
      }
      document.body.removeChild(textarea);
    } else {
      console.error("No variant selected");
    }
  };

 

  const variantActions = useMemo(() => () => [
    {
      onClick: downloadVariantPGN,
      icon: <DownloadIcon />,
      label: "Download",
    },
    {
      onClick: copyVariantPGN,
      icon: <ContentCopyIcon />,
      label: "Copy",
    },
    {
      onClick: () => selectedVariant && copyVariantToRepertoire(selectedVariant),
      icon: <FileCopyIcon />,
      label: "Copy to Repertoire",
    },
    {
      onClick: copyVariantsToRepertoire,
      icon: <ContentPaste />,
      label: "Paste Variants",
    },
    {
      onClick: () => selectedVariant && deleteVariant(selectedVariant),
      icon: <DeleteIcon />,
      label: "Delete",
    },
    {
      onClick: deleteVariants,
      icon: <DeleteSweep />,
      label: "Delete All",
    },
  ], [selectedVariant, copyVariantToRepertoire, copyVariantsToRepertoire, deleteVariant, deleteVariants, downloadVariantPGN]);

  return (
    <>
      <Box>
        {selectedVariant && (
          <VariantActionButtons actions={variantActions()} />
        )}
        <Box>
          {selectedVariant && (
            <Grid item xs>
              <SelectVariant
                variants={variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            </Grid>
          )}
          <Box>
            {/* <Movements moves={selectedVariant?.moves} /> */}
            {selectedVariant?.moves && (
              <VariantMovementsPanel
                moves={selectedVariant?.moves}
                changeNameMove={changeNameMove}
                currentMoveNode={currentMoveNode}
                deleteMove={deleteMove}
                goToMove={goToMove}
                maxHeight="300px"
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default VariantTree;
