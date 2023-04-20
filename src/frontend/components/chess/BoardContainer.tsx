import React, { useCallback } from "react";
import { Grid, useTheme } from "@mui/material";
import Board from "./Board";
import BoardActions from "./BoardActions";
import BoardInfo from "./BoardInfo";
import useSaveRepertoire from "../../hooks.tsx/useSaveRepertoire";


const BoardContainer: React.FC = () => {
  const theme = useTheme();
  useSaveRepertoire();

  const calcWidth = useCallback(
    ({ screenWidth }: { screenWidth: number }): number => {
      if (screenWidth >= theme.breakpoints.values.sm) {
        return (screenWidth * 35) / 100;
      } else {
        return (screenWidth * 90) / 100;
      }
    },
    [theme.breakpoints.values.sm]
  );

  return (
    
      <Grid container spacing={2}>
        <Grid
          item
          container
          direction="column"
          alignItems="center"
          xs={12}
          sm={8}
        >
          <Grid item>
            <Board calcWidth={calcWidth} />
          </Grid>
          <Grid item>
            <BoardActions />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={4}>
          <BoardInfo />
        </Grid>
      </Grid>
  );
};

export default BoardContainer;
