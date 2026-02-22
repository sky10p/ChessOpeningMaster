import React from "react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ReviewRating } from "@chess-opening-master/common";
import { PendingVariantReview } from "../../../contexts/TrainRepertoireContext";

interface ReviewRatingDialogProps {
  open: boolean;
  pendingVariantReview: PendingVariantReview | null;
  selectedRating: ReviewRating;
  isSavingRating: boolean;
  onSelectRating: (rating: ReviewRating) => void;
  onClose: () => void;
}

const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];

export const ReviewRatingDialog: React.FC<ReviewRatingDialogProps> = ({
  open,
  pendingVariantReview,
  selectedRating,
  isSavingRating,
  onSelectRating,
  onClose,
}) => {
  if (!pendingVariantReview) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <DialogBackdrop className="fixed inset-0 bg-black/70" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl rounded-lg border border-border-default bg-surface-raised p-5 shadow-elevated">
          <DialogTitle className="text-lg font-semibold text-text-base">Rate This Review</DialogTitle>
          <Description className="mt-1 text-sm text-text-muted">{pendingVariantReview.variantName}</Description>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-text-muted">
            <div>Wrong moves: {pendingVariantReview.wrongMoves}</div>
            <div>Ignored errors: {pendingVariantReview.ignoredWrongMoves}</div>
            <div>Hints used: {pendingVariantReview.hintsUsed}</div>
            <div>Time: {pendingVariantReview.timeSpentSec}s</div>
          </div>
          <p className="mt-3 text-sm text-text-base">
            Suggested: <span className="font-semibold">{pendingVariantReview.suggestedRating}</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={isSavingRating}
                onClick={() => onSelectRating(rating)}
                className={`rounded px-3 py-2 text-sm font-semibold transition ${
                  selectedRating === rating
                    ? "bg-brand text-text-on-brand"
                    : "bg-surface text-text-muted hover:bg-interactive"
                } ${isSavingRating ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {rating}
              </button>
            ))}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
