import React from "react";
import { Button, Card } from "../../../components/ui";

interface TrainOpeningActionsProps {
  totalVariantsCount: number;
  onStartNormalMode: () => void;
  onViewOpening: () => void;
}

export const TrainOpeningActions: React.FC<TrainOpeningActionsProps> = ({
  totalVariantsCount,
  onStartNormalMode,
  onViewOpening,
}) => {
  return (
    <Card className="border-border-default bg-surface" padding="default" elevation="raised">
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-text-base">Train Opening</h3>
        <p className="text-sm text-text-muted">
          Start normal training for all {totalVariantsCount} variants. Use actions in each variant row for per-variant Normal or Focus mode.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button intent="primary" size="sm" onClick={onStartNormalMode} className="justify-center sm:w-fit">
            Train All Variants
          </Button>
          <Button intent="secondary" size="sm" onClick={onViewOpening} className="justify-center sm:w-fit">
            View Opening
          </Button>
        </div>
      </div>
    </Card>
  );
};
