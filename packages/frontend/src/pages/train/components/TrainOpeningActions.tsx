import React from "react";
import { Button, Card } from "../../../components/ui";

interface TrainOpeningActionsProps {
  totalVariantsCount: number;
  onStartNormalMode: () => void;
}

export const TrainOpeningActions: React.FC<TrainOpeningActionsProps> = ({
  totalVariantsCount,
  onStartNormalMode,
}) => {
  return (
    <Card className="border-border-default bg-surface" padding="default" elevation="raised">
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-text-base">Train Opening</h3>
        <p className="text-sm text-text-muted">
          Start normal training for all {totalVariantsCount} variants. Use actions in each variant row for per-variant Normal or Focus mode.
        </p>
        <Button intent="primary" size="sm" onClick={onStartNormalMode} className="justify-center sm:w-fit">
          Train All Variants
        </Button>
      </div>
    </Card>
  );
};
