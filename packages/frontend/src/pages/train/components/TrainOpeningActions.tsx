import React from "react";
import { Badge, Button, Card, SectionHeader } from "../../../components/ui";

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
    <Card className="border-border-default bg-surface" padding="relaxed" elevation="raised">
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Start review"
          description="Launch the opening-level session or jump into the editor when you need to inspect the full line tree."
          action={
            <Badge variant="brand" size="sm">
              {totalVariantsCount} variants ready
            </Badge>
          }
        />
        <div className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-raised p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-base">Primary next action</p>
            <p className="text-sm leading-6 text-text-muted">
              Review the full opening in one session, then use per-variant controls below when you need targeted repetition.
            </p>
          </div>
          <Button intent="primary" size="md" onClick={onStartNormalMode} className="justify-center sm:w-fit">
            Start review
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button intent="secondary" size="md" onClick={onViewOpening} className="justify-center sm:w-fit">
            Open editor
          </Button>
        </div>
      </div>
    </Card>
  );
};
