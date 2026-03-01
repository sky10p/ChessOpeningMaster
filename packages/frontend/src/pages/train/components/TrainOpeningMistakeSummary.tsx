import React from "react";
import { VariantMistake } from "@chess-opening-master/common";
import { Badge, Button, Card } from "../../../components/ui";
import { toUtcDateKey } from "../../../utils/dateUtils";
import { getDueTrainMistakes, isTrainMistakeDue } from "../mistakeUtils";

interface TrainOpeningMistakeSummaryProps {
  mistakes: VariantMistake[];
  onReviewDueMistakes: () => void;
  onTrainSpecificMistake: (mistake: VariantMistake) => void;
}

export const TrainOpeningMistakeSummary: React.FC<TrainOpeningMistakeSummaryProps> = ({
  mistakes,
  onReviewDueMistakes,
  onTrainSpecificMistake,
}) => {
  const now = new Date();
  const todayDayKey = toUtcDateKey(now);
  const dueMistakes = getDueTrainMistakes(mistakes, now);

  return (
    <Card className="border-border-default bg-surface" padding="default" elevation="raised">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-base">Mistakes</h3>
          <Badge variant="warning" size="sm">
            {dueMistakes.length} due
          </Badge>
        </div>
        <Button
          intent="accent"
          size="sm"
          onClick={onReviewDueMistakes}
          disabled={dueMistakes.length === 0}
          className="justify-center sm:w-fit"
        >
          Train Mistakes Only
        </Button>
        {mistakes.length === 0 ? (
          <p className="text-sm text-text-muted">No stored mistakes for this opening yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {mistakes.slice(0, 16).map((mistake) => (
              <div key={mistake.mistakeKey} className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-text-base break-all">{mistake.variantName}</p>
                  <Badge variant={isTrainMistakeDue(mistake, now, todayDayKey) ? "danger" : "default"} size="sm">
                    {isTrainMistakeDue(mistake, now, todayDayKey) ? "Due" : "Scheduled"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-text-muted break-all">
                  {mistake.expectedMoveSan || mistake.expectedMoveLan} - Ply {mistake.mistakePly}
                </p>
                <div className="mt-2">
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() => onTrainSpecificMistake(mistake)}
                    className="justify-center"
                  >
                    Train This Mistake
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
