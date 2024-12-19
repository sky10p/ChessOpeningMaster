
import React, { useEffect, useMemo } from "react";
import {
  Grid,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import ExamIcon from "@mui/icons-material/AssignmentTurnedIn"; // Import a suitable icon

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
import { getSpacedRepetitionVariants } from "../../../utils/chess/spacedRepetition/spacedRepetition";

const TrainRepertoireViewContainer: React.FC = () => {
  const [panelSelected, setPanelSelected] = React.useState<
    "info" | "help" | "trainComments"
  >("info");
  const navigate = useNavigate();
  const { repertoireId, repertoireName, currentMoveNode, variants } =
    useRepertoireContext();
  const { showTrainVariantsDialog, showNumberDialog } = useDialogContext();
  const { addIcon: addIconHeader, removeIcon: removeIconHeader } =
    useHeaderContext();
  const {
    trainVariants,
    chooseTrainVariantsToTrain,
    allowedMoves,
    isYourTurn,
    turn,
    finishedTrain,
    lastTrainVariant,
  } = useTrainRepertoireContext();
  const {
    addIcon: addIconFooter,
    removeIcon: removeIconFooter,
    setIsVisible,
  } = useFooterContext();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  useEffect(() => {
    const headerIcons = [
      {
        key: "examMode",
        icon: <ExamIcon />,
        onClick: () => {
          showNumberDialog({
            title: "Exam Mode",
            contentText: "Enter the number of variants to train:",
            min: 1,
            max: variants.length,
            initialValue: 5,
            onNumberConfirm: async (number) => {
              const variantsToStudy = await getSpacedRepetitionVariants(number, repertoireId, trainVariants);
              chooseTrainVariantsToTrain(variantsToStudy);
            },
          });
        },
      },
      {
        key: "selectTrainVariants",
        icon: <ChecklistIcon />,
        onClick: () => {
          showTrainVariantsDialog({
            title: "Select train variants",
            contentText: "Select the variants you want to train",
            trainVariants: variants.map((v) => ({ variant: v, state: "inProgress" })),
            repertoireId,
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
  }, [
    addIconHeader,
    removeIconHeader,
    showTrainVariantsDialog,
    showNumberDialog,
    trainVariants,
    chooseTrainVariantsToTrain,
    navigate,
    repertoireId,
    variants,
  ]);

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
          {panelSelected === "info" && (
            <TrainInfo
              currentMoveNode={currentMoveNode}
              turn={turn}
              isYourTurn={isYourTurn}
              finishedTrain={finishedTrain}
              trainVariants={trainVariants}
              lastTrainVariant={lastTrainVariant}
            />
          )}
          {panelSelected === "help" && (
            <HelpInfo allowedMoves={allowedMoves} isYourTurn={isYourTurn} />
          )}
          {panelSelected === "trainComments" && (
            <HintInfo currentMoveNode={currentMoveNode} />
          )}
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
            <TrainInfo
              currentMoveNode={currentMoveNode}
              turn={turn}
              isYourTurn={isYourTurn}
              finishedTrain={finishedTrain}
              trainVariants={trainVariants}
              lastTrainVariant={lastTrainVariant}
            />
          </Grid>
        </>
      );
    }
  }, [
    isMobile,
    allowedMoves,
    turn,
    finishedTrain,
    trainVariants,
    lastTrainVariant,
    currentMoveNode,
    isYourTurn,
    panelSelected,
  ]);

  return (
    <Grid container spacing={2}>
      <Grid item container direction="column" alignItems="left" xs={12} sm={5}>
        {isMobile && (
          <Grid
            item
            container
            justifyContent="center"
            style={{ marginBottom: "16px" }}
          >
            <HelpInfo allowedMoves={allowedMoves} isYourTurn={isYourTurn} />
          </Grid>
        )}
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
          <BoardContainer isTraining={true} />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={5} container direction="column" alignItems="left">
        {renderPanelContent}
      </Grid>
    </Grid>
  );
};

export default TrainRepertoireViewContainer;