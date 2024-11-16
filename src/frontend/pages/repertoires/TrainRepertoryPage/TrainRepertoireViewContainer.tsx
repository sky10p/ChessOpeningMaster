import React, { useCallback, useEffect } from "react";
import {
  Grid,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Board from "../../../components/chess/board/Board";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";

import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useFooterContext } from "../../../contexts/FooterContext";

import ChatIcon from "@mui/icons-material/Chat";
import TrainInfo from "../../../components/chess/panels/train/TrainInfo";
import HelpInfo from "../../../components/chess/panels/train/HelpInfo";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";
import { useNavigate } from "react-router-dom";
import { useDialogContext } from "../../../contexts/DialogContext";
import { TrainVariant } from "../../../components/chess/models/chess.models";
import { HintInfo } from "../../../components/chess/panels/train/HintInfo";

const TrainRepertoireViewContainer: React.FC = () => {
  const theme = useTheme();
  const [panelSelected, setPanelSelected] = React.useState<"info" | "help" | "trainComments">("info");
  const navigate = useNavigate();
  const { repertoireId, repertoireName } = useRepertoireContext();
  const { showTrainVariantsDialog } = useDialogContext();
  const { addIcon: addIconHeader, removeIcon: removeIconHeader } = useHeaderContext();
  const { trainVariants, chooseTrainVariantsToTrain } = useTrainRepertoireContext();
  const { addIcon: addIconFooter, removeIcon: removeIconFooter, setIsVisible } = useFooterContext();

  const calcWidth = useCallback(
    ({ screenWidth }: { screenWidth: number }): number => screenWidth >= theme.breakpoints.values.sm ? (screenWidth * 35) / 100 : (screenWidth * 90) / 100,
    [theme.breakpoints.values.sm]
  );

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  useEffect(() => {
    addIconHeader({
      key: "selectTrainVariants",
      icon: <ChecklistIcon />,
      onClick: () => {
        showTrainVariantsDialog({
          title: "Select train variants",
          contentText: "Select the variants you want to train",
          trainVariants,
          onTrainVariantsConfirm: (selectedTrainVariants: TrainVariant[]) => {
            chooseTrainVariantsToTrain(selectedTrainVariants);
          },
        });
      },
    });
    addIconHeader({
      key: "goToEditRepertoire",
      icon: <EditIcon />,
      onClick: () => {
        navigate(`/repertoire/${repertoireId}`);
      },
    });
    return () => {
      removeIconHeader("selectTrainVariants");
      removeIconHeader("goToEditRepertoire");
    };
  }, [addIconHeader, removeIconHeader, showTrainVariantsDialog, trainVariants, chooseTrainVariantsToTrain, navigate, repertoireId]);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      addIconFooter({
        key: "info",
        label: "Train info",
        icon: <InfoIcon />,
        onClick: () => setPanelSelected("info"),
      });
      addIconFooter({
        key: "trainComments",
        label: "Comments",
        icon: <ChatIcon />,
        onClick: () => setPanelSelected("trainComments"),
      });
    }

    return () => {
      setIsVisible(false);
      removeIconFooter("info");
      removeIconFooter("trainComments");
    };
  }, [isMobile, addIconFooter, removeIconFooter, setIsVisible]);

  const renderPanelContent = () => {
    if (isMobile) {
      return (
        <Grid item>
          {panelSelected === "info" && <TrainInfo />}
          {panelSelected === "help" && <HelpInfo />}
          {panelSelected === "trainComments" && <HintInfo />}
        </Grid>
      );
    } else {
      return (
        <>
          <Grid item style={{ marginTop: "24px" }}>
            <HelpInfo />
          </Grid>
          <Grid item style={{ marginTop: "36px" }}>
            <HintInfo />
          </Grid>
          <Grid item style={{ marginTop: "36px" }}>
            <TrainInfo />
          </Grid>
        </>
      );
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item container direction="column" alignItems="left" xs={12} sm={5}>
        {isMobile && (
          <Grid item container justifyContent="center" style={{ marginBottom: "16px" }}>
            <HelpInfo />
          </Grid>
        )}
        <Grid item container justifyContent={"center"}>
          <Typography variant="h5" gutterBottom style={{ marginBottom: "16px" }}>
            Training {repertoireName}
          </Typography>
        </Grid>
        <Grid item container justifyContent={"center"}>
          <Board calcWidth={calcWidth} isTraining={true} />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={5} container direction="column" alignItems="left">
        {renderPanelContent()}
      </Grid>
    </Grid>
  );
};

export default TrainRepertoireViewContainer;
