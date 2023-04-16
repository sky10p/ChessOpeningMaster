import React from "react";
import { useBoardContext } from "./BoardContext";
import { Box,  Typography,  } from "@mui/material";
import VariantTree from "./VariantTree";


const BoardInfo: React.FC = () => {
  const {goToMove, moveHistory, currentMoveNode } = useBoardContext();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Variants
      </Typography>
      <VariantTree variants={moveHistory.getVariants()}   currentNode={currentMoveNode} onClickNode={goToMove}></VariantTree>
    </Box>
  );
};

export default BoardInfo;
