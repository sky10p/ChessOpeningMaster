import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { MoveVariantNode } from "../../utils/VariantNode";
import { Variant } from "../../models/chess.models";
import { SelectVariant } from "../../selects/SelectVariant";
import { MovementAndTurnNodeButtonWithActions } from "../../buttons/MovementAndTurnNodeButtonWithActions";
import { variantToPgn } from "../../utils/pgn.utils";
import { BoardOrientation } from "../../../../../common/types/Orientation";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
  orientation: BoardOrientation;
  deleteVariant: (variant: Variant) => void;
}

const VariantTree: React.FC<VariantTreeProps> = ({ variants, currentNode, orientation, deleteVariant }) => {
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

  const moveNodesWithActions = useMemo(() => {
    const moves = selectedVariant?.moves;
    const moveComponents = [];

    if (moves) {
      for (let i = 0; i < moves.length; i += 2) {
        const moveWhite = moves[i];
        const moveBlack = moves[i + 1];
        moveComponents.push(
          <MovementAndTurnNodeButtonWithActions
            key={moveWhite.getUniqueKey()}
            moveWhite={moveWhite}
            moveBlack={moveBlack}
          />
        );
      }
    }

    return moveComponents;
  }, [selectedVariant]);

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
      console.error('No variant selected');
    }
  };


  return (
    <>
      <Grid container spacing={2} alignItems="center" mb={2} justifyContent="flex-start" wrap="nowrap">
        {selectedVariant && (
          <>
            <Grid item xs>
              <SelectVariant
                variants={variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            </Grid>
            <Grid item>
              <IconButton
                onClick={downloadVariantPGN}
                color="primary"
              >
                <DownloadIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                onClick={copyVariantPGN}
                color="primary"
              >
                <ContentCopyIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => deleteVariant(selectedVariant)}
                color="primary"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </>
        )}
      </Grid>
      <Box>{moveNodesWithActions}</Box>
    </>
  );
};

export default VariantTree;
