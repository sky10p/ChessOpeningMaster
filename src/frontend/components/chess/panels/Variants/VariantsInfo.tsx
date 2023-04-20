import React from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { Box, Typography } from "@mui/material";
import VariantsTree from "./VariantTree";

const VariantsInfo: React.FC = () => {
  const { variants, currentMoveNode } =
    useRepertoireContext();
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

export default VariantsInfo;
