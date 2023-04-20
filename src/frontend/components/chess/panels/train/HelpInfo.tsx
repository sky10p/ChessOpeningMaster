// HelpInfo.tsx
import React, { useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const HelpInfo: React.FC = () => {
  const [iconVisible, setIconVisible] = useState(true);

  // Simula las jugadas permitidas
  const allowedMoves = ["e4", "d4", "Nf3", "c4", "g3"];

  const toggleVisibility = () => {
    setIconVisible(!iconVisible);
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item container alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={toggleVisibility}>
            {iconVisible ? (
              <VisibilityIcon />
            ) : (
              <VisibilityOffIcon />
            )}
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="body1">View available movements</Typography>
        </Grid>
      </Grid>
      <Grid item container direction="row" wrap="wrap" spacing={1}>
        {!iconVisible && allowedMoves.map((move, index) => (
          <Grid item key={index}>
            <Button variant="outlined">{move}</Button>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default HelpInfo;
