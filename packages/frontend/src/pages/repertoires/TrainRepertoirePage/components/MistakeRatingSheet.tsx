import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ReviewRating } from "@chess-opening-master/common";
import { Button } from "../../../../components/ui";

interface MistakeRatingSheetProps {
  open: boolean;
  isSaving: boolean;
  onRate: (rating: ReviewRating) => void;
}

const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];

export const MistakeRatingSheet: React.FC<MistakeRatingSheetProps> = ({
  open,
  isSaving,
  onRate,
}) => {
  return (
    <Dialog open={open} onClose={() => undefined} className="fixed inset-0 z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-end justify-center p-3 sm:items-center">
        <DialogPanel className="w-full max-w-lg rounded-xl border border-border-default bg-surface p-4 shadow-elevated">
          <DialogTitle className="text-base font-semibold text-text-base">
            Rate This Mistake Review
          </DialogTitle>
          <p className="mt-1 text-sm text-text-muted">
            Choose how difficult this correction felt.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ratings.map((rating) => (
              <Button
                key={rating}
                intent="secondary"
                size="sm"
                loading={isSaving}
                disabled={isSaving}
                onClick={() => onRate(rating)}
                className="justify-center capitalize"
              >
                {rating}
              </Button>
            ))}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
