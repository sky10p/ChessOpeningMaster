import React, { useCallback } from "react";
import { Grid, useTheme } from "@mui/material";
import Board from "./Board";
import BoardActions from "./BoardActions";
import { BoardContextProvider } from "./BoardContext";
import BoardInfo from "./BoardInfo";
import { IMoveNode } from "../../../common/types/MoveNode";
import BoardSaveButton from "./BoardSaveButton";
import { BoardOrientation } from "../../../common/types/Orientation";

interface BoardContainerProps {
  repertoireId: string;
  repertoireName: string;
  orientation?: BoardOrientation;
  initialMoves?: IMoveNode;
}
const BoardContainer: React.FC<BoardContainerProps> = ({
  repertoireId,
  repertoireName,
  orientation,
  initialMoves,
}) => {
  const theme = useTheme();

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
    <BoardContextProvider
      repertoireId={repertoireId}
      repertoireName={repertoireName}
      initialMoves={initialMoves}
      initialOrientation={orientation ?? "white"}
    >
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
          <BoardSaveButton />
          <BoardInfo />
        </Grid>
      </Grid>
    </BoardContextProvider>
  );
};

export default BoardContainer;
