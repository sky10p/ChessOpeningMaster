import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { MoveNodeButtonWithActions } from "../../../application/chess/board/MoveNodeButtonWithActions";
import { Button, Card } from "../../../ui";

interface HelpInfoProps {
  allowedMoves: MoveVariantNode[];
  isYourTurn: boolean;
  currentMoveNode: MoveVariantNode;
  onHintReveal: () => void;
  assistEnabled?: boolean;
  assistNotice?: string;
}

const HelpInfo: React.FC<HelpInfoProps> = ({
  allowedMoves,
  isYourTurn,
  currentMoveNode,
  onHintReveal,
  assistEnabled = true,
  assistNotice,
}) => {
  const [iconVisible, setIconVisible] = useState(true);

  useEffect(() => {
    if (!isYourTurn) {
      setIconVisible(true);
    }
  }, [isYourTurn]);

  useEffect(() => {
    setIconVisible(true);
  }, [currentMoveNode.id, currentMoveNode.position]);

  const toggleVisibility = () => {
    if (iconVisible && isYourTurn && allowedMoves.length > 0) {
      onHintReveal();
    }
    setIconVisible(!iconVisible);
  };

  return (
    <Card className="h-full w-full border-border-default bg-surface" padding="default">
      <div className="mb-4 flex items-center justify-center space-x-2">
        {assistEnabled ? (
          <Button
            onClick={toggleVisibility}
            intent="accent"
            size="sm"
            aria-label="Toggle Available Moves"
            className="h-8 w-8 rounded-full p-0"
          >
            {iconVisible ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </Button>
        ) : null}
        <span className="text-base font-semibold text-text-base">
          Available Moves
        </span>
      </div>
      {assistNotice ? (
        <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          {assistNotice}
        </div>
      ) : null}
      {!assistEnabled ? (
        <div className="mb-4 text-center text-sm text-text-muted">
          Hints unlock in focus mode after your first error.
        </div>
      ) : null}
      {iconVisible && (
        <div className="mb-4 text-center text-sm text-text-muted">
          {!assistEnabled
            ? "Make your first mistake to unlock guidance."
            : isYourTurn && allowedMoves.length > 0
            ? "Tap the arrow to reveal playable moves."
            : "Available moves will appear on your turn."}
        </div>
      )}
      {assistEnabled && !iconVisible && isYourTurn && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm text-text-muted">Tap again to hide moves</span>
          <div className="flex flex-wrap justify-center gap-2">
            {allowedMoves.map((move, index) => (
              <MoveNodeButtonWithActions key={index} move={move} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default HelpInfo;
