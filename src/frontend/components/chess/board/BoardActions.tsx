import React from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";

import { useBoardContext } from "../../../contexts/RepertoireContext";

const BoardActions: React.FC = () => {

const {next, prev, hasNext, hasPrev, rotateBoard} = useBoardContext();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
      <IconButton color="primary" onClick={prev} disabled={!hasPrev()}>
        <ArrowBackIcon />
      </IconButton>
      <IconButton color="primary" onClick={next} disabled={!hasNext()}>
        <ArrowForwardIcon />
      </IconButton>
      <IconButton color="primary" onClick={rotateBoard}>
        <RotateLeftIcon />
      </IconButton>
    </Box>
  );
};

export default BoardActions;
