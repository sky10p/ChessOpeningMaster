import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";
import { useHeaderDispatch } from "../../../contexts/HeaderContext";
import { useDialogContext } from "../../../contexts/DialogContext";
import { TrainVariant } from "../../../models/chess.models";
import { getSpacedRepetitionVariants } from "../../../utils/chess/spacedRepetition/spacedRepetition";
import { HintInfo } from "../../../components/design/chess/train/HintInfo";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import {
  InformationCircleIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import TrainInfo from "../../../components/design/chess/train/TrainInfo";
import HelpInfo from "../../../components/design/chess/train/HelpInfo";
import { CheckListIcon } from "../../../components/icons/CheckListIcon";
import { ExamIcon } from "../../../components/icons/ExamIcon";
import { useFooterDispatch } from "../../../contexts/FooterContext";

const TrainRepertoireViewContainer: React.FC = () => {
  const [panelSelected, setPanelSelected] = React.useState<
    "info" | "help" | "trainComments"
  >("info");
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { repertoireId, repertoireName, currentMoveNode, orientation, variants, updateComment } =
    useRepertoireContext();
  const { showTrainVariantsDialog, showNumberDialog } = useDialogContext();
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
  } = useTrainRepertoireContext();
  const {
    addIcon: addIconFooter,
    removeIcon: removeIconFooter,
    setIsVisible,
  } = useFooterDispatch();

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
            trainVariants: variants.map((v) => ({
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
      {
        key: "focusMode",
        icon: isFocusMode ? <EyeSlashIcon /> : <EyeIcon />,
        onClick: () => setIsFocusMode((prev) => !prev),
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
    isFocusMode,
  ]);

  useEffect(() => {
    if (!isFocusMode) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    const footerIcons = [
      {
        key: "info",
        label: "Train info",
        icon: <InformationCircleIcon className="h-6 w-6 text-accent" />,
        onClick: () => setPanelSelected("info"),
      },
      {
        key: "trainComments",
        label: "Comments",
        icon: <ChatBubbleLeftIcon className="h-6 w-6 text-accent" />,
        onClick: () => setPanelSelected("trainComments"),
      },
      {
        key: "help",
        label: "Help",
        icon: <ClipboardDocumentIcon className="h-6 w-6 text-accent" />,
        onClick: () => setPanelSelected("help"),
      },
    ];

    if (!isFocusMode) {
      footerIcons.forEach(({ key, label, icon, onClick }) => {
        addIconFooter({ key, label, icon, onClick });
      });
    }

    return () => {
      setIsVisible(false);
      footerIcons.forEach(({ key }) => {
        removeIconFooter(key);
      });
    };
  }, [addIconFooter, removeIconFooter, setIsVisible, isFocusMode]);

  const renderPanelContent = useMemo(
    () => (
      <div className="bg-gray-800 p-4 rounded shadow-md w-full h-full">
        <div className="sm:hidden">
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
            <HintInfo currentMoveNode={currentMoveNode} orientation={orientation} updateComment={updateComment} />
          )}
        </div>
        <div className="hidden sm:flex flex-col space-y-4 h-full">
          <div className="h-2/5"><HintInfo currentMoveNode={currentMoveNode} orientation={orientation} updateComment={updateComment} /></div>

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

  return (
    <div
      className={`container mx-auto p-1 sm:p-4 h-full text-textLight ${
        isFocusMode ? "bg-slate-950/70" : "bg-background"
      }`}
    >
      <div
        className={`grid grid-cols-1 gap-4 h-full ${
          isFocusMode ? "sm:grid-cols-1" : "sm:grid-cols-2"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2 mb-1 sm:mb-4">
            {isFocusMode && (
              <span className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Focus Mode
              </span>
            )}
            <h5 className="text-base sm:text-xl font-bold text-textLight">
              Training {repertoireName}
            </h5>
            <p className="text-xs sm:text-sm text-textLight/70">
              {isFocusMode
                ? "Stay in the zone — panel distractions hidden."
                : "Review moves, hints, and comments while training."}
            </p>
          </div>
          <div className="flex justify-center w-full">
            <div
              className={`rounded-2xl border border-secondary/60 bg-gray-900/60 p-3 shadow-lg ${
                isFocusMode ? "max-w-2xl" : "max-w-md"
              }`}
            >
              <BoardContainer isTraining={true} />
            </div>
          </div>
        </div>
        {!isFocusMode && (
          <div className="flex flex-col items-start h-full overflow-auto border border-secondary/70 rounded bg-gray-800/90 shadow-md">
            {renderPanelContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainRepertoireViewContainer;
