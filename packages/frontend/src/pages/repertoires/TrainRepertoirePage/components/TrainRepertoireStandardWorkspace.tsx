import React from "react";
import { BoardOrientation, Turn } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TrainVariant } from "../../../../models/chess.models";
import { RepertoireWorkspaceLayout } from "../../shared/RepertoireWorkspaceLayout";
import TrainInfo from "../../../../components/design/chess/train/TrainInfo";
import HelpInfo from "../../../../components/design/chess/train/HelpInfo";
import { HintInfo } from "../../../../components/design/chess/train/HintInfo";

interface TrainRepertoireStandardWorkspaceProps {
  title: string;
  board: React.ReactNode;
  boardActions?: React.ReactNode;
  panelSelected: "info" | "help" | "trainComments";
  currentMoveNode: MoveVariantNode;
  orientation: BoardOrientation;
  updateComment: (comment: string) => Promise<void>;
  turn: Turn;
  isYourTurn: boolean;
  finishedTrain: boolean;
  trainVariants: TrainVariant[];
  lastTrainVariant: TrainVariant | undefined;
  allowedMoves: MoveVariantNode[];
  repertoireId: string;
  markHintUsed: () => void;
}

export const TrainRepertoireStandardWorkspace: React.FC<
  TrainRepertoireStandardWorkspaceProps
> = ({
  title,
  board,
  boardActions,
  panelSelected,
  currentMoveNode,
  orientation,
  updateComment,
  turn,
  isYourTurn,
  finishedTrain,
  trainVariants,
  lastTrainVariant,
  allowedMoves,
  repertoireId,
  markHintUsed,
}) => {
  const mobilePanelContent = (
    <div className="h-full w-full min-h-0 overflow-y-auto p-4">
      {panelSelected === "info" ? (
        <TrainInfo
          currentMoveNode={currentMoveNode}
          turn={turn}
          isYourTurn={isYourTurn}
          finishedTrain={finishedTrain}
          trainVariants={trainVariants}
          lastTrainVariant={lastTrainVariant}
          repertoireId={repertoireId}
          onHintReveal={markHintUsed}
        />
      ) : null}
      {panelSelected === "help" ? (
        <HelpInfo
          allowedMoves={allowedMoves}
          isYourTurn={isYourTurn}
          currentMoveNode={currentMoveNode}
          onHintReveal={markHintUsed}
        />
      ) : null}
      {panelSelected === "trainComments" ? (
        <HintInfo
          currentMoveNode={currentMoveNode}
          orientation={orientation}
          updateComment={updateComment}
        />
      ) : null}
    </div>
  );

  const desktopPanelContent = (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="h-2/5 min-h-[220px]">
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
        onHintReveal={markHintUsed}
      />
    </div>
  );

  return (
    <RepertoireWorkspaceLayout
      title={title}
      board={board}
      boardActions={boardActions}
      mobilePanel={mobilePanelContent}
      desktopPanel={desktopPanelContent}
    />
  );
};
