import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { VariantMistake } from "@chess-opening-master/common";
import { Badge, Button, Card, EmptyState, ListRow, SectionHeader } from "../../../components/ui";
import { toUtcDateKey } from "../../../utils/dateUtils";
import { getDueTrainMistakes, isTrainMistakeDue } from "../mistakeUtils";

interface TrainOpeningMistakeSummaryProps {
  mistakes: VariantMistake[];
  onReviewDueMistakes: () => void;
  onTrainSpecificMistake: (mistake: VariantMistake) => void;
  compact?: boolean;
  visibleLimit?: number;
}

export const TrainOpeningMistakeSummary: React.FC<TrainOpeningMistakeSummaryProps> = ({
  mistakes,
  onReviewDueMistakes,
  onTrainSpecificMistake,
  compact = false,
  visibleLimit,
}) => {
  const now = new Date();
  const todayDayKey = toUtcDateKey(now);
  const dueMistakes = getDueTrainMistakes(mistakes, now);
  const orderedMistakes = [...mistakes].sort((left, right) => {
    const leftDue = isTrainMistakeDue(left, now, todayDayKey);
    const rightDue = isTrainMistakeDue(right, now, todayDayKey);
    if (leftDue !== rightDue) {
      return leftDue ? -1 : 1;
    }
    return left.variantName.localeCompare(right.variantName);
  });
  const visibleMistakes =
    typeof visibleLimit === "number" ? orderedMistakes.slice(0, visibleLimit) : orderedMistakes;

  return (
    <Card padding="relaxed" elevation="raised" className="flex h-full flex-col">
      <SectionHeader
        title="Mistakes"
        description={
          compact
            ? undefined
            : "Review stored errors separately when a line needs reinforcement instead of a full opening run."
        }
        action={
          mistakes.length > 0 ? (
            <Badge variant={dueMistakes.length > 0 ? "warning" : "default"} size="sm">
              {dueMistakes.length} due
            </Badge>
          ) : null
        }
      />

      {mistakes.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={CheckCircleIcon}
          title="All clear!"
          description="No stored mistakes for this opening yet."
          className="flex-1"
        />
      ) : (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <Button
            intent="accent"
            size="md"
            onClick={onReviewDueMistakes}
            disabled={dueMistakes.length === 0}
            className="mb-4 w-full justify-center shrink-0"
          >
            Train Due Mistakes
          </Button>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {visibleMistakes.map((mistake) => {
              const isDue = isTrainMistakeDue(mistake, now, todayDayKey);
              return (
                <ListRow
                  key={mistake.mistakeKey}
                  className="bg-surface-raised"
                  title={
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="line-clamp-2">{mistake.variantName}</span>
                      <Badge variant={isDue ? "danger" : "default"} size="sm">
                        {isDue ? "Due now" : "Scheduled"}
                      </Badge>
                    </div>
                  }
                  description={
                    <span className="leading-6">
                      Expected {mistake.expectedMoveSan || mistake.expectedMoveLan} at ply {mistake.mistakePly}.
                    </span>
                  }
                  meta={
                    compact ? undefined : (
                      <Badge variant="info" size="sm">
                        Key {mistake.mistakeKey}
                      </Badge>
                    )
                  }
                  actions={
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => onTrainSpecificMistake(mistake)}
                      className="w-full justify-center sm:w-auto"
                    >
                      Train this mistake
                    </Button>
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
