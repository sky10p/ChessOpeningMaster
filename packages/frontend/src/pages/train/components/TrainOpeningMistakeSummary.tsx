import React from "react";
import { VariantMistake } from "@chess-opening-master/common";
import { Badge, Button, Card } from "../../../components/ui";

interface TrainOpeningMistakeSummaryProps {
  mistakes: VariantMistake[];
  onReviewDueMistakes: () => void;
  onTrainSpecificMistake: (mistake: VariantMistake) => void;
}

const getTodayDayKey = (): string => new Date().toISOString().slice(0, 10);

const isDue = (mistake: VariantMistake, todayDayKey: string): boolean =>
  mistake.dueAt.getTime() <= Date.now() && mistake.lastReviewedDayKey !== todayDayKey;

export const TrainOpeningMistakeSummary: React.FC<TrainOpeningMistakeSummaryProps> = ({
  mistakes,
  onReviewDueMistakes,
  onTrainSpecificMistake,
}) => {
  const todayDayKey = getTodayDayKey();
  const dueMistakes = mistakes.filter((mistake) => isDue(mistake, todayDayKey));

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
          disabled={mistakes.length === 0}
          className="justify-center sm:w-fit"
        >
          Train Mistakes Only
        </Button>
        {mistakes.length === 0 ? (
          <p className="text-sm text-text-muted">No stored mistakes for this opening yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {mistakes.slice(0, 16).map((mistake) => (
              <div
                key={mistake.mistakeKey}
                className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-text-base break-all">{mistake.variantName}</p>
                  <Badge variant={isDue(mistake, todayDayKey) ? "danger" : "default"} size="sm">
                    {isDue(mistake, todayDayKey) ? "Due" : "Scheduled"}
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
