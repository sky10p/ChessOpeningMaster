import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";
import { useHeaderDispatch } from "../../../contexts/HeaderContext";
import { useDialogContext } from "../../../contexts/DialogContext";
import { TrainVariant, Variant } from "../../../models/chess.models";
import { getSpacedRepetitionVariants } from "../../../utils/chess/spacedRepetition/spacedRepetition";
import { HintInfo } from "../../../components/design/chess/train/HintInfo";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import {
  InformationCircleIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import TrainInfo from "../../../components/design/chess/train/TrainInfo";
import HelpInfo from "../../../components/design/chess/train/HelpInfo";
import { CheckListIcon } from "../../../components/icons/CheckListIcon";
import { ExamIcon } from "../../../components/icons/ExamIcon";
import { useFooterDispatch } from "../../../contexts/FooterContext";
import { RepertoireWorkspaceLayout } from "../shared/RepertoireWorkspaceLayout";
import { ReviewRating } from "@chess-opening-master/common";
import { useAlertContext } from "../../../contexts/AlertContext";
import { ReviewRatingDialog } from "../../../components/design/dialogs/ReviewRatingDialog";

const TrainRepertoireViewContainer: React.FC = () => {
  const [panelSelected, setPanelSelected] = React.useState<
    "info" | "help" | "trainComments"
  >("info");
  const navigate = useNavigate();
  const location = useLocation();
  const { repertoireId, repertoireName, currentMoveNode, orientation, variants, updateComment } =
    useRepertoireContext();
  const { showTrainVariantsDialog, showNumberDialog } = useDialogContext();
  const { showAlert } = useAlertContext();
  const { addIcon: addIconHeader, removeIcon: removeIconHeader } =
    useHeaderDispatch();
  const {
    trainVariants,
    chooseTrainVariantsToTrain,
    allowedMoves,
    isYourTurn,
    turn,
    finishedTrain,
    lastTrainVariant,
    pendingVariantReview,
    submitPendingVariantReview,
  } = useTrainRepertoireContext();
  const [selectedRating, setSelectedRating] = React.useState<ReviewRating>("good");
  const [isSavingRating, setIsSavingRating] = React.useState(false);
  const {
    addIcon: addIconFooter,
    removeIcon: removeIconFooter,
    setIsVisible,
  } = useFooterDispatch();

  useEffect(() => {
    if (!pendingVariantReview) {
      return;
    }
    setSelectedRating(pendingVariantReview.suggestedRating);
  }, [pendingVariantReview]);

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
              const variantsToStudy = await getSpacedRepetitionVariants(
                number,
                repertoireId,
                trainVariants
              );
              chooseTrainVariantsToTrain(variantsToStudy);
            },
          });
        },
      },
      {
        key: "selectTrainVariants",
        icon: <CheckListIcon />,
        onClick: () => {
          showTrainVariantsDialog({
            title: "Select train variants",
            contentText: "Select the variants you want to train",
            trainVariants: variants.map((v: Variant) => ({
              variant: v,
              state: "inProgress",
            })),
            repertoireId,
            onTrainVariantsConfirm: (selectedTrainVariants: TrainVariant[]) => {
              chooseTrainVariantsToTrain(selectedTrainVariants);
            },
          });
        },
      },
      {
        key: "goToEditRepertoire",
        icon: <PencilIcon />,
        onClick: () => {
          const queryParams = new URLSearchParams(location.search);
          const variantName = queryParams.get("variantName");
          const editUrl = variantName 
            ? `/repertoire/${repertoireId}?variantName=${encodeURIComponent(variantName)}`
            : `/repertoire/${repertoireId}`;
          navigate(editUrl);
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
    location.search,
    repertoireId,
    variants,
  ]);

  useEffect(() => {
    setIsVisible(true);
    const footerIcons = [
      {
        key: "info",
        label: "Train info",
        icon: <InformationCircleIcon className="h-6 w-6" />,
        onClick: () => setPanelSelected("info"),
      },
      {
        key: "trainComments",
        label: "Comments",
        icon: <ChatBubbleLeftIcon className="h-6 w-6" />,
        onClick: () => setPanelSelected("trainComments"),
      },
      {
        key: "help",
        label: "Help",
        icon: <ClipboardDocumentIcon className="h-6 w-6" />,
        onClick: () => setPanelSelected("help"),
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
  }, [addIconFooter, removeIconFooter, setIsVisible]);

  const mobilePanelContent = useMemo(
    () => (
      <div className="w-full h-full p-4">
        {panelSelected === "info" && (
          <TrainInfo
            currentMoveNode={currentMoveNode}
            turn={turn}
            isYourTurn={isYourTurn}
            finishedTrain={finishedTrain}
            trainVariants={trainVariants}
            lastTrainVariant={lastTrainVariant}
            repertoireId={repertoireId}
          />
        )}
        {panelSelected === "help" && (
          <HelpInfo allowedMoves={allowedMoves} isYourTurn={isYourTurn} />
        )}
        {panelSelected === "trainComments" && (
          <HintInfo
            currentMoveNode={currentMoveNode}
            orientation={orientation}
            updateComment={updateComment}
          />
        )}
      </div>
    ),
    [
      panelSelected,
      currentMoveNode,
      turn,
      isYourTurn,
      finishedTrain,
      trainVariants,
      lastTrainVariant,
      allowedMoves,
      repertoireId,
      orientation,
      updateComment,
    ]
  );

  const desktopPanelContent = useMemo(
    () => (
      <div className="w-full h-full p-4 flex flex-col gap-4">
        <div className="h-2/5 min-h-[200px]">
          <HintInfo
            currentMoveNode={currentMoveNode}
            orientation={orientation}
            updateComment={updateComment}
          />
        </div>
        <TrainInfo
          currentMoveNode={currentMoveNode}
          turn={turn}
          isYourTurn={isYourTurn}
          finishedTrain={finishedTrain}
          trainVariants={trainVariants}
          lastTrainVariant={lastTrainVariant}
          repertoireId={repertoireId}
        />
      </div>
    ),
    [
      currentMoveNode,
      orientation,
      updateComment,
      turn,
      isYourTurn,
      finishedTrain,
      trainVariants,
      lastTrainVariant,
      repertoireId,
    ]
  );

  const handleReviewRating = async (rating: ReviewRating) => {
    try {
      setIsSavingRating(true);
      await submitPendingVariantReview(rating);
    } catch (error) {
      showAlert("Failed to save review rating", "error", 1800);
    } finally {
      setIsSavingRating(false);
    }
  };

  const handleReviewDialogClose = () => {
    if (isSavingRating || !pendingVariantReview) {
      return;
    }
    void handleReviewRating(selectedRating);
  };

  return (
    <>
      <RepertoireWorkspaceLayout
        title={`Training ${repertoireName}`}
        board={<BoardContainer isTraining={true} />}
        mobilePanel={mobilePanelContent}
        desktopPanel={desktopPanelContent}
      />
      <ReviewRatingDialog
        open={Boolean(pendingVariantReview)}
        pendingVariantReview={pendingVariantReview}
        selectedRating={selectedRating}
        isSavingRating={isSavingRating}
        onClose={handleReviewDialogClose}
        onSelectRating={(rating) => {
          setSelectedRating(rating);
          void handleReviewRating(rating);
        }}
      />
    </>
  );
};

export default TrainRepertoireViewContainer;
