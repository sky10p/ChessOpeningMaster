import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ReviewRating } from "@chess-opening-master/common";
import { PendingVariantReview } from "../../../../contexts/TrainRepertoireContext";
import { Badge, Button } from "../../../../components/ui";
import { MasteryDeltaCard } from "./MasteryDeltaCard";
import { computeNextMastery } from "../../../../contexts/TrainRepertoireContext.utils";

interface VariantResultsModalProps {
  open: boolean;
  pendingVariantReview: PendingVariantReview | null;
  selectedRating: ReviewRating;
  isSaving: boolean;
  onSelectRating: (rating: ReviewRating) => void;
  onFinish: () => void;
  onFixMistakes: () => void;
}

const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];

export const VariantResultsModal: React.FC<VariantResultsModalProps> = ({
  open,
  pendingVariantReview,
  selectedRating,
  isSaving,
  onSelectRating,
  onFinish,
  onFixMistakes,
}) => {
  if (!pendingVariantReview) {
    return null;
  }

  const computedMasteryAfter = computeNextMastery({
    previousMastery: pendingVariantReview.masteryBefore,
    rating: selectedRating,
    wrongMoves: pendingVariantReview.wrongMoves,
    ignoredWrongMoves: pendingVariantReview.ignoredWrongMoves,
    hintsUsed: pendingVariantReview.hintsUsed,
  });

  const totalMistakes =
    pendingVariantReview.wrongMoves + pendingVariantReview.ignoredWrongMoves;
  const reinforcementCount = pendingVariantReview.reinforcementMistakes.length;
  const hasMistakes = reinforcementCount > 0;
  const accuracy = Math.max(0, 100 - totalMistakes * 12 - pendingVariantReview.hintsUsed * 5);

  return (
    <Dialog open={open} onClose={onFinish} className="fixed inset-0 z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 flex items-end justify-center p-3 sm:items-center">
        <DialogPanel className="w-full max-w-xl rounded-xl border border-border-default bg-surface p-4 shadow-elevated sm:p-5">
          <DialogTitle className="text-lg font-semibold text-text-base">
            Variant Complete
          </DialogTitle>
          <p className="mt-1 text-sm text-text-muted break-words">
            {pendingVariantReview.variantName}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
              <div className="text-xs text-text-subtle">Mistakes</div>
              <div className="text-sm font-semibold text-text-base">
                {pendingVariantReview.wrongMoves}
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
              <div className="text-xs text-text-subtle">Ignored Errors</div>
              <div className="text-sm font-semibold text-text-base">
                {pendingVariantReview.ignoredWrongMoves}
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
              <div className="text-xs text-text-subtle">Hints</div>
              <div className="text-sm font-semibold text-text-base">
                {pendingVariantReview.hintsUsed}
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
              <div className="text-xs text-text-subtle">Accuracy</div>
              <div className="text-sm font-semibold text-text-base">{accuracy}%</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="info" size="sm">
              Time {pendingVariantReview.timeSpentSec}s
            </Badge>
            <Badge variant="brand" size="sm">
              Suggested {pendingVariantReview.suggestedRating}
            </Badge>
            <Badge variant={hasMistakes ? "warning" : "success"} size="sm">
              {hasMistakes ? `${reinforcementCount} mistakes to fix` : "Clean run"}
            </Badge>
          </div>

          <div className="mt-3">
            <MasteryDeltaCard
              before={pendingVariantReview.masteryBefore}
              after={computedMasteryAfter}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ratings.map((rating) => (
              <Button
                key={rating}
                intent={selectedRating === rating ? "primary" : "secondary"}
                size="sm"
                disabled={isSaving}
                onClick={() => onSelectRating(rating)}
                className="justify-center capitalize"
              >
                {rating}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {hasMistakes ? (
              <Button
                intent="accent"
                size="md"
                loading={isSaving}
                disabled={isSaving}
                onClick={onFixMistakes}
                className="w-full justify-center"
              >
                Fix Mistakes Now
              </Button>
            ) : null}
            <Button
              intent={hasMistakes ? "secondary" : "primary"}
              size="md"
              loading={isSaving}
              disabled={isSaving}
              onClick={onFinish}
              className="w-full justify-center"
            >
              {hasMistakes ? "Finish" : "Continue"}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
