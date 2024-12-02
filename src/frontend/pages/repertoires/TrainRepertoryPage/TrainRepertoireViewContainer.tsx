import React, { useCallback, useEffect, useMemo } from "react";
import {
  Grid,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";

import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useFooterContext } from "../../../contexts/FooterContext";

import ChatIcon from "@mui/icons-material/Chat";
import TrainInfo from "../../../components/design/chess/train/TrainInfo";
import HelpInfo from "../../../components/design/chess/train/HelpInfo";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";
import { useNavigate } from "react-router-dom";
import { useDialogContext } from "../../../contexts/DialogContext";
import { TrainVariant } from "../../../models/chess.models";
import { HintInfo } from "../../../components/design/chess/train/HintInfo";

const TrainRepertoireViewContainer: React.FC = () => {
  const theme = useTheme();
  const [panelSelected, setPanelSelected] = React.useState<"info" | "help" | "trainComments">("info");
  const navigate = useNavigate();
  const { repertoireId, repertoireName, currentMoveNode } = useRepertoireContext();
  const { showTrainVariantsDialog } = useDialogContext();
  const { addIcon: addIconHeader, removeIcon: removeIconHeader } = useHeaderContext();
  const { trainVariants, chooseTrainVariantsToTrain, allowedMoves, isYourTurn, turn, finishedTrain } = useTrainRepertoireContext();
  const { addIcon: addIconFooter, removeIcon: removeIconFooter, setIsVisible } = useFooterContext();

  const calcWidth = useCallback(
    ({ screenWidth }: { screenWidth: number }): number => screenWidth >= theme.breakpoints.values.sm ? (screenWidth * 35) / 100 : (screenWidth * 90) / 100,
    [theme.breakpoints.values.sm]
  );

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  useEffect(() => {
    const headerIcons = [
      {
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
      },
      {
        key: "goToEditRepertoire",
        icon: <EditIcon />,
        onClick: () => {
          navigate(`/repertoire/${repertoireId}`);
        },
      },
    ];

    headerIcons.forEach(({ key, icon, onClick }) => {
      addIconHeader({ key, icon, onClick });
    });

    return () => {
      headerIcons.forEach(({ key }) => {
        removeIconHeader(key);
      });
    };
  }, [addIconHeader, removeIconHeader, showTrainVariantsDialog, trainVariants, chooseTrainVariantsToTrain, navigate, repertoireId]);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      const footerIcons = [
        {
          key: "info",
          label: "Train info",
          icon: <InfoIcon />,
          onClick: () => setPanelSelected("info"),
        },
        {
          key: "trainComments",
          label: "Comments",
          icon: <ChatIcon />,
          onClick: () => setPanelSelected("trainComments"),
        },
      ];

      footerIcons.forEach(({ key, label, icon, onClick }) => {
        addIconFooter({ key, label, icon, onClick });
      });

      return () => {
        setIsVisible(false);
        footerIcons.forEach(({ key }) => {
          removeIconFooter(key);
        });
      };
    }
  }, [isMobile, addIconFooter, removeIconFooter, setIsVisible]);

  const renderPanelContent = useMemo(() => {
    if (isMobile) {
      return (
        <Grid item>
          {panelSelected === "info" && <TrainInfo currentMoveNode={currentMoveNode} turn={turn} isYourTurn={isYourTurn} finishedTrain={finishedTrain} trainVariants={trainVariants} />}
          {panelSelected === "help" && <HelpInfo allowedMoves={allowedMoves} isYourTurn={isYourTurn} />}
          {panelSelected === "trainComments" && <HintInfo currentMoveNode={currentMoveNode} />}
        </Grid>
      );
    } else {
      return (
        <>
          <Grid item style={{ marginTop: "24px" }}>
            <HelpInfo allowedMoves={allowedMoves} isYourTurn={isYourTurn} />
          </Grid>
          <Grid item style={{ marginTop: "36px" }}>
            <HintInfo currentMoveNode={currentMoveNode} />
          </Grid>
          <Grid item style={{ marginTop: "36px" }}>
            <TrainInfo currentMoveNode={currentMoveNode} turn={turn} isYourTurn={isYourTurn} finishedTrain={finishedTrain} trainVariants={trainVariants} />
          </Grid>
        </>
      );
    }
  }, [isMobile, allowedMoves,turn,finishedTrain,trainVariants, currentMoveNode, isYourTurn, panelSelected]);

  return (
    <Grid container spacing={2}>
      <Grid item container direction="column" alignItems="left" xs={12} sm={5}>
        {isMobile && (
          <Grid item container justifyContent="center" style={{ marginBottom: "16px" }}>
            <HelpInfo allowedMoves={allowedMoves} isYourTurn={isYourTurn} />
          </Grid>
        )}
        <Grid item container justifyContent={"center"}>
          <Typography variant="h5" gutterBottom style={{ marginBottom: "16px" }}>
            Training {repertoireName}
          </Typography>
        </Grid>
        <Grid item container justifyContent={"center"}>
          <BoardContainer calcWidth={calcWidth} isTraining={true} />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={5} container direction="column" alignItems="left">
        {renderPanelContent}
      </Grid>
    </Grid>
  );
};

export default TrainRepertoireViewContainer;
