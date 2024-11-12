// HelpInfo.tsx
import React, { useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTrainRepertoireContext } from "../../../../contexts/TrainRepertoireContext";
import { MoveNodeButtonWithActions } from "../../buttons/MoveNodeButtonWithActions";

const HelpInfo: React.FC = () => {
  const [iconVisible, setIconVisible] = useState(true);
  const {allowedMoves, isYourTurn} = useTrainRepertoireContext();

  const toggleVisibility = () => {
    setIconVisible(!iconVisible);
  };

  return (
    <Grid container direction="column" alignItems="center" spacing={2} style={{ marginBottom: "16px" }}>
      <Grid item container alignItems="center" justifyContent="center" spacing={1}>
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
          <Typography variant="body1" fontWeight="bold">
            Available Moves
          </Typography>
        </Grid>
      </Grid>
      {!iconVisible && isYourTurn && (
        <Grid item container direction="row" justifyContent="center" wrap="wrap" spacing={1}>
          {allowedMoves.map((move, index) => (
            <Grid item key={index}>
              <MoveNodeButtonWithActions move={move} />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default HelpInfo;
