import React from "react";
import { FullRunConfirmState } from "../../../../contexts/TrainRepertoireContext";
import { Badge, Button, Card } from "../../../../components/ui";
import { MasteryDeltaCard } from "./MasteryDeltaCard";

interface FullRunConfirmPanelProps {
  state: FullRunConfirmState;
  onFinish: () => void;
}

export const FullRunConfirmPanel: React.FC<FullRunConfirmPanelProps> = ({
  state,
  onFinish,
}) => {
  return (
    <Card
      className="fixed left-3 right-3 top-16 z-40 border-border-default bg-surface shadow-elevated sm:left-auto sm:right-4 sm:top-20 sm:w-[380px]"
      padding="default"
      elevation="high"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-text-base">Full Run To Confirm</h3>
          <Badge variant={state.completed ? (state.perfect ? "success" : "warning") : "brand"} size="sm">
            {state.completed ? (state.perfect ? "Perfect" : "Retry Soon") : "In Progress"}
          </Badge>
        </div>
        <p className="text-sm text-text-muted">
          {state.completed
            ? state.perfect
              ? "Perfect confirmation run completed."
              : "Run completed with mistakes. Keep reinforcing this line."
            : "Play the full variant cleanly to lock in mastery gains."}
        </p>
        {state.completed ? (
          <MasteryDeltaCard before={state.masteryBefore} after={state.masteryAfter} />
        ) : null}
        {state.completed ? (
          <Button intent="primary" size="sm" onClick={onFinish} className="w-full justify-center">
            Finish
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
