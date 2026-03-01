import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { VariantMistake } from "@chess-opening-master/common";
import { Badge, Button, Card, EmptyState } from "../../../components/ui";
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
    <Card padding="default" elevation="raised" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-base">Mistakes</h3>
        {mistakes.length > 0 && (
          <Badge variant={dueMistakes.length > 0 ? "warning" : "default"} size="sm">
            {dueMistakes.length} Due
          </Badge>
        )}
      </div>

      {mistakes.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={CheckCircleIcon}
          title="All clear!"
          description="No stored mistakes for this opening yet."
          className="flex-1"
        />
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <Button
            intent="accent"
            size="md"
            onClick={onReviewDueMistakes}
            disabled={dueMistakes.length === 0}
            className="w-full justify-center mb-4 shrink-0"
          >
            Train Due Mistakes
          </Button>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {mistakes.slice(0, 16).map((mistake) => {
              const isDue = isTrainMistakeDue(mistake, now, todayDayKey);
              return (
                <div
                  key={mistake.mistakeKey}
                  className="rounded-xl border border-border-subtle bg-surface-raised p-3 flex flex-col gap-2 transition-colors hover:border-border-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-text-base line-clamp-2">
                      {mistake.variantName}
                    </p>
                    <Badge variant={isDue ? "danger" : "default"} size="sm" className="shrink-0">
                      {isDue ? "Due" : "Scheduled"}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-muted">
                    Expected: <span className="font-medium text-text-base">{mistake.expectedMoveSan || mistake.expectedMoveLan}</span> at ply {mistake.mistakePly}
                  </p>

                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() => onTrainSpecificMistake(mistake)}
                    className="w-full justify-center mt-1"
                  >
                    Train This Mistake
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
