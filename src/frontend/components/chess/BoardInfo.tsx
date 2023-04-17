import React from "react";
import { useBoardContext } from "./BoardContext";
import { Box, Typography } from "@mui/material";
import VariantTree from "./VariantTree";

const BoardInfo: React.FC = () => {
  const { goToMove, variants, changeNameMove, deleteMove, currentMoveNode } =
    useBoardContext();
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Variants
      </Typography>
      <VariantTree
        variants={variants}
        currentNode={currentMoveNode}
        onClickNode={goToMove}
        onDeleteNode={deleteMove}
        onChangeNodeName={changeNameMove}
      ></VariantTree>
    </Box>
  );
};

export default BoardInfo;
