import React from "react";
import { useBoardContext } from "./BoardContext";
import { Box, Typography } from "@mui/material";
import VariantsTree from "./VariantTree";

const BoardInfo: React.FC = () => {
  const { variants, currentMoveNode } =
    useBoardContext();
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Variants
      </Typography>
      <VariantsTree
        variants={variants}
        currentNode={currentMoveNode}
      ></VariantsTree>
    </Box>
  );
};

export default BoardInfo;
