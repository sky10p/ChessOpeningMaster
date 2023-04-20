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
  const {allowedMoves} = useTrainRepertoireContext();


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
            <MoveNodeButtonWithActions move={move} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default HelpInfo;
