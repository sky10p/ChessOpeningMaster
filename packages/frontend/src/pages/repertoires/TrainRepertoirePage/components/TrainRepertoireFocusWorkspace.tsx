import React from "react";
import { BoardOrientation, Turn } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TrainVariant } from "../../../../models/chess.models";
import { RepertoireWorkspaceLayout } from "../../shared/RepertoireWorkspaceLayout";
import TrainInfo from "../../../../components/design/chess/train/TrainInfo";
import { FocusAssistCard } from "./FocusAssistCard";
import { Button } from "../../../../components/ui";

interface TrainRepertoireFocusWorkspaceProps {
  title: string;
  board: React.ReactNode;
  boardActions?: React.ReactNode;
  currentMoveNode: MoveVariantNode;
  orientation: BoardOrientation;
  updateComment: (comment: string) => Promise<void>;
  turn: Turn;
  isYourTurn: boolean;
  finishedTrain: boolean;
  trainVariants: TrainVariant[];
  lastTrainVariant: TrainVariant | undefined;
  repertoireId: string;
  markHintUsed: () => void;
  pendingErrorCount: number;
  hasAssistContent: boolean;
  onBack?: () => void;
}

export const TrainRepertoireFocusWorkspace: React.FC<
  TrainRepertoireFocusWorkspaceProps
> = ({
  title,
  board,
  boardActions,
  currentMoveNode,
  orientation,
  updateComment,
  turn,
  isYourTurn,
  finishedTrain,
  trainVariants,
  lastTrainVariant,
  repertoireId,
  markHintUsed,
  pendingErrorCount,
  hasAssistContent,
  onBack,
}) => {
  const assistPanel = (
    <FocusAssistCard
      hasErrors={hasAssistContent}
      pendingErrorCount={pendingErrorCount}
      currentMoveNode={currentMoveNode}
      orientation={orientation}
      updateComment={updateComment}
      trainVariants={trainVariants}
      onHintReveal={markHintUsed}
    />
  );

  const panelContent = (
    <div className="h-full w-full min-h-0 overflow-y-auto p-4">
      {onBack ? (
        <div className="mb-3">
          <Button
            intent="secondary"
            size="sm"
            onClick={onBack}
            className="w-full justify-center sm:w-auto"
          >
            Back to opening
          </Button>
        </div>
      ) : null}
      <TrainInfo
        currentMoveNode={currentMoveNode}
        turn={turn}
        isYourTurn={isYourTurn}
        finishedTrain={finishedTrain}
        trainVariants={trainVariants}
        lastTrainVariant={lastTrainVariant}
        repertoireId={repertoireId}
        onHintReveal={markHintUsed}
        showAvailableVariantsSection={false}
        supplementalPanel={assistPanel}
      />
    </div>
  );

  return (
    <RepertoireWorkspaceLayout
      title={title}
      board={board}
      boardActions={boardActions}
      mobilePanel={panelContent}
      desktopPanel={panelContent}
    />
  );
};
