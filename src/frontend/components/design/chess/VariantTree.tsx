import React, { useEffect, useState } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { DeleteSweep, ContentPaste } from "@mui/icons-material";
import { MoveVariantNode } from "../../../models/VariantNode";
import { Variant } from "../../../models/chess.models";
import { SelectVariant } from "../SelectVariant";
import { variantToPgn } from "../../../utils/chess/pgn/pgn.utils";
import { BoardOrientation } from "../../../../common/types/Orientation";
import { Movements } from "./edit/Movements";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
  orientation: BoardOrientation;
  deleteVariant: (variant: Variant) => void;
  copyVariantToRepertoire: (variant: Variant) => void;
  deleteVariants: () => void;
  copyVariantsToRepertoire: () => void;
}

const VariantTree: React.FC<VariantTreeProps> = ({
  variants,
  currentNode,
  orientation,
  deleteVariant,
  copyVariantToRepertoire,
  copyVariantsToRepertoire,
  deleteVariants,
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

  return (
    <>
      <Grid
        container
        spacing={2}
        alignItems="center"
        mb={2}
        justifyContent="flex-start"
        wrap="nowrap"
      >
        {selectedVariant && (
          <>
            <Grid item>
              <IconButton onClick={downloadVariantPGN} color="primary">
                <DownloadIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={copyVariantPGN} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => copyVariantToRepertoire(selectedVariant)}
                color="primary"
              >
                <FileCopyIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={copyVariantsToRepertoire} color="primary">
                <ContentPaste />
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
            <Grid item>
              <IconButton onClick={deleteVariants} color="primary">
                <DeleteSweep />
              </IconButton>
            </Grid>
          </>
        )}
      </Grid>
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
        <Movements moves={selectedVariant?.moves} />
      </Box>
    </>
  );
};

export default VariantTree;
