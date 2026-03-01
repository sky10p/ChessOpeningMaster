import React from "react";
import { ReinforcementSession } from "../../../../contexts/TrainRepertoireContext";
import { Card } from "../../../../components/ui";
import { MistakeProgressHeader } from "./MistakeProgressHeader";
import { cn } from "../../../../utils/cn";

interface MistakeReinforcementPanelProps {
  session: ReinforcementSession;
  placement?: "inline" | "overlay" | "desktopOverlay";
}

export const MistakeReinforcementPanel: React.FC<
  MistakeReinforcementPanelProps
> = ({ session, placement = "overlay" }) => {
  const currentMistake = session.queue[0];
  const isInline = placement === "inline";
  const isDesktopOverlay = placement === "desktopOverlay";

  return (
    <Card
      className={cn(
        "border-border-default bg-surface",
        isInline
          ? "w-full"
          : "fixed left-3 right-3 top-16 z-40 sm:left-auto sm:right-4 sm:top-20 sm:w-[360px]",
        isDesktopOverlay && "hidden sm:block"
      )}
      padding="compact"
      elevation={isInline ? "raised" : "high"}
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
