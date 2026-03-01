import React from "react";
import { ReinforcementSession } from "../../../../contexts/TrainRepertoireContext";
import { Card } from "../../../../components/ui";
import { MistakeProgressHeader } from "./MistakeProgressHeader";

interface MistakeReinforcementPanelProps {
  session: ReinforcementSession;
}

export const MistakeReinforcementPanel: React.FC<
  MistakeReinforcementPanelProps
> = ({ session }) => {
  const currentMistake = session.queue[0];

  return (
    <Card
      className="fixed left-3 right-3 top-16 z-40 border-border-default bg-surface shadow-elevated sm:left-auto sm:right-4 sm:top-20 sm:w-[360px]"
      padding="compact"
      elevation="high"
    >
      <div className="space-y-3">
        <MistakeProgressHeader solved={session.solved} total={session.total} />
        {currentMistake ? (
          <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
            <p className="text-xs text-text-subtle">Current fix</p>
            <p className="text-sm font-semibold text-text-base">
              {currentMistake.expectedMoveSan || currentMistake.expectedMoveLan}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Variant: {currentMistake.variantName}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Play the correct move on the board.
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Preparing next mistake...</p>
        )}
      </div>
    </Card>
  );
};
