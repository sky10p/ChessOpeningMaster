import React, { useCallback, useEffect } from "react";
import {
  Grid,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Board from "../../../components/chess/board/Board";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { BoardComment } from "../../../components/chess/panels/BoardComments";
import { useFooterContext } from "../../../contexts/FooterContext";

import ChatIcon from "@mui/icons-material/Chat";
import TrainInfo from "../../../components/chess/panels/train/TrainInfo";
import HelpInfo from "../../../components/chess/panels/train/HelpInfo";

const TrainRepertoireViewContainer: React.FC = () => {
  const theme = useTheme();

  const [panelSelected, setPanelSelected] = React.useState<
    "info" | "help" | "trainComments"
  >("info");

  const { repertoireName } = useRepertoireContext();

  const { addIcon, removeIcon, setIsVisible } = useFooterContext();

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

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      addIcon({
        key: "info",
        label: "Train info",
        icon: <InfoIcon />,
        onClick: () => setPanelSelected("info"),
      });
      addIcon({
        key: "help",
        label: "Help",
        icon: <HelpOutlineIcon />,
        onClick: () => setPanelSelected("help"),
      });
      addIcon({
        key: "trainComments",
        label: "Comments",
        icon: <ChatIcon />,
        onClick: () => setPanelSelected("trainComments"),
      });
    }

    return () => {
      setIsVisible(false);
      removeIcon("info");
      removeIcon("help");
      removeIcon("trainComments");
    };
  }, [isMobile]);

  return (
    <Grid container spacing={2}>
      <Grid item container direction="column" alignItems="left" xs={12} sm={5}>
        <Grid item container justifyContent={"center"}>
          <Typography
            variant="h5"
            gutterBottom
            style={{ marginBottom: "16px" }}
          >
            Training {repertoireName}
          </Typography>
        </Grid>
        <Grid item container justifyContent={"center"}>
          <Board calcWidth={calcWidth} isTraining={true} />
        </Grid>
       
      </Grid>
      <Grid item xs={12} sm={5} container direction="column" alignItems="left">
        {isMobile && panelSelected === "info" && (
          <>
            <Grid item>
              <TrainInfo />
            </Grid>
          </>
        )}
        {isMobile && panelSelected === "help" && (
          <>
            <Grid item>
              <HelpInfo />
            </Grid>
          </>
        )}
        {isMobile && panelSelected === "trainComments" && (
          <>
            <Grid item>
              <BoardComment editable={false} />
            </Grid>
          </>
        )}
        {!isMobile && (
          <>
            <Grid item style={{ marginTop: "24px" }}>
              <BoardComment editable={false} />
            </Grid>
            <Grid item style={{ marginTop: "36px" }}>
              <TrainInfo />
            </Grid>
            <Grid item style={{ marginTop: "36px" }}>
              <HelpInfo />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default TrainRepertoireViewContainer;
