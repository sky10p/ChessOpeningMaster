import React, { useCallback, useEffect } from "react";
import {
  Grid,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Board from "../../../components/chess/board/Board";
import BoardActions from "../../../components/chess/board/BoardActions";
import BoardInfo from "../../../components/chess/panels/Variants/VariantsInfo";
import useSaveRepertoire from "../../../hooks.tsx/useSaveRepertoire";
import { useBoardContext } from "../../../contexts/RepertoireContext";
import { BoardComments } from "../../../components/chess/panels/BoardComments";
import { useFooterContext } from "../../../contexts/FooterContext";

import ChatIcon from '@mui/icons-material/Chat';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const RepertoireViewContainer: React.FC = () => {
  const theme = useTheme();

  const [panelSelected, setPanelSelected] = React.useState<
    "variants" | "comments"
  >("variants");



  const { repertoireName } = useBoardContext();
  useSaveRepertoire();

  const {addIcon, removeIcon, setIsVisible } = useFooterContext();

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

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  useEffect(()=> {
    if(isMobile){
      setIsVisible(true);
      addIcon({
        key: "variants",
        label: "Variants",
        icon: <AccountTreeIcon/>,
        onClick: () => setPanelSelected("variants"),
      });
      addIcon({
        key: "comments",
        label: "Comments",
        icon: <ChatIcon/>,
        onClick: () => setPanelSelected("comments"),
      });
    }

    return ()=> {
      setIsVisible(false);
      removeIcon("variants");
      removeIcon("comments");
    }
  }, [isMobile])

  return (
    <Grid container spacing={2}>
      <Grid item container direction="column" alignItems="left" xs={12} sm={5}>
        <Grid item container justifyContent={"center"}>
          <Typography
            variant="h5"
            gutterBottom
            style={{ marginBottom: "16px" }}
          >
            {repertoireName}
          </Typography>
        </Grid>
        <Grid item container justifyContent={"center"}>
          <Board calcWidth={calcWidth} />
        </Grid>
        <Grid item container justifyContent="center">
          <BoardActions />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={5} container direction="column" alignItems="left">
        {isMobile && panelSelected === "variants" && (
          <>
            <Grid item>
              <BoardInfo />
            </Grid>
          </>
        )}
        {isMobile && panelSelected === "comments" && (
          <>
            <Grid item>
              <BoardComments />
            </Grid>
          </>
        )}
        {!isMobile && (
          <>
            <Grid item>
              <BoardInfo />
            </Grid>
            <Grid item>
              <BoardComments />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default RepertoireViewContainer;
