import React from "react";
import { PencilIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import whiteKing from "../../../../assets/white-king.svg";
import blackKing from "../../../../assets/black-king.svg";
import { TrainVariant } from "../../../../models/chess.models";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { variantToPgn } from "../../../../utils/chess/pgn/pgn.utils";
import { Turn } from "@chess-opening-master/common";
import { useNavigationUtils } from "../../../../utils/navigationUtils";
import { Button, Card } from "../../../ui";
import { TrainAvailableVariantsPanel } from "./TrainAvailableVariantsPanel";

interface TrainInfoProps {
  turn: Turn;
  isYourTurn: boolean;
  trainVariants: TrainVariant[];
  finishedTrain: boolean;
  lastTrainVariant: TrainVariant | undefined;
  currentMoveNode: MoveVariantNode;
  repertoireId: string;
  onHintReveal: () => void;
  assistEnabled?: boolean;
  assistNotice?: string;
  showAvailableVariantsSection?: boolean;
  supplementalPanel?: React.ReactNode;
}

const TrainInfo: React.FC<TrainInfoProps> = ({
  turn,
  isYourTurn,
  trainVariants,
  finishedTrain,
  lastTrainVariant,
  currentMoveNode,
  repertoireId,
  onHintReveal,
  assistEnabled = true,
  assistNotice,
  showAvailableVariantsSection = true,
  supplementalPanel,
}) => {
  const { goToRepertoire } = useNavigationUtils();
  const navigate = useNavigate();

  const currentVariant = trainVariants.filter(
    (variant) => variant.state === "finished"
  ).length;
  const totalVariants = trainVariants.length;

  const handleCopyPgn = async () => {
    if (lastTrainVariant) {
      const pgn = await variantToPgn(lastTrainVariant.variant, turn, new Date());
      navigator.clipboard.writeText(pgn);
    }
  };

  const handleEditVariant = () => {
    if (lastTrainVariant) {
      goToRepertoire(repertoireId, lastTrainVariant.variant.fullName);
    }
  };

  return (
    <Card className="w-full border-border-default bg-surface" padding="relaxed">
      {lastTrainVariant && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-text-base">Last Finished Variant</h2>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-sm text-text-muted">{lastTrainVariant.variant.fullName}</span>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyPgn}
                intent="accent"
                size="sm"
              >
                Copy PGN
              </Button>
              <Button
                onClick={handleEditVariant}
                intent="secondary"
                size="sm"
                className="flex items-center gap-1"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center gap-2">
        {!finishedTrain ? (
          <img
            src={turn === "white" ? whiteKing : blackKing}
            alt={`${turn} king`}
            className="h-6 w-6"
          />
        ) : null}
        <h3 className="text-base font-semibold text-text-base">
          {finishedTrain
            ? "Finished Training"
            : isYourTurn
            ? "Your turn"
            : "Opponent's turn"}
        </h3>
      </div>
      {!finishedTrain ? (
        <p className="mb-4 text-sm text-text-muted">
          {isYourTurn
            ? "Play one of your allowed moves according to your repertoire."
            : "Wait for your opponent to play."}
        </p>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          <Button intent="primary" size="sm" onClick={() => navigate("/train")}>
            Back to Train
          </Button>
          <Button intent="secondary" size="sm" onClick={() => navigate("/path")}>
            Review Path
          </Button>
          <Button intent="secondary" size="sm" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
        </div>
      )}
      <div className="mb-4">
        <span className="text-sm text-text-muted">
          {`${currentVariant} of ${totalVariants} variants`}
        </span>
        <div className="mt-2 h-2.5 w-full rounded-full bg-surface-raised">
          <div
            className="h-2.5 rounded-full bg-accent"
            style={{
              width: `${totalVariants > 0 ? (currentVariant / totalVariants) * 100 : 0}%`,
            }}
          ></div>
        </div>
      </div>
      {supplementalPanel ? <div className="mb-4">{supplementalPanel}</div> : null}
      {showAvailableVariantsSection ? (
        <TrainAvailableVariantsPanel
          trainVariants={trainVariants}
          currentMoveNode={currentMoveNode}
          onHintReveal={onHintReveal}
          assistEnabled={assistEnabled}
          assistNotice={assistNotice}
        />
      ) : null}
    </Card>
  );
};

export default TrainInfo;
