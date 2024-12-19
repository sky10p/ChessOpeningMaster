import React from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";


interface BoardActionsProps {
    next: () => void;
    prev: () => void;
    hasNext: () => boolean;
    hasPrev: () => boolean;
    rotateBoard: () => void;
}

const BoardActions: React.FC<BoardActionsProps> = ({
    next,
    prev,
    hasNext,
    hasPrev,
    rotateBoard,
}) => {

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
