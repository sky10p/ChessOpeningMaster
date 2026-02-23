import React from "react";
import { ReinforcementMoveProgress } from "../../../../contexts/TrainRepertoireContext";
import { Card } from "../../../../components/ui";
import { cn } from "../../../../utils/cn";

interface FocusModeMoveProgressProps {
  progress: ReinforcementMoveProgress;
}

export const FocusModeMoveProgress: React.FC<FocusModeMoveProgressProps> = ({
  progress,
}) => {
  return (
    <Card className="w-full max-w-[60vh] border-border-default bg-surface" padding="compact">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-subtle">Focus progress</p>
        <p className="text-xs text-text-muted">
          Step {Math.min(progress.statuses.length, progress.activeIndex + 1)}/
          {progress.statuses.length}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {progress.statuses.map((status, index) => (
          <span
            key={`${progress.mistakeKey}::${index}`}
            className={cn(
              "h-3.5 w-3.5 rounded-sm border border-border-default transition-all",
              status === "success" && "bg-success border-success",
              status === "failed" && "bg-danger border-danger",
              status === "pending" && "bg-surface-raised",
              progress.activeIndex === index && "ring-2 ring-brand ring-offset-1 ring-offset-surface"
            )}
          />
        ))}
      </div>
    </Card>
  );
};
