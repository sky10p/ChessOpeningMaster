import React from "react";
import { TrainOpeningVariantItem } from "@chess-opening-master/common";
import { Badge, Button, Card } from "../../../components/ui";

interface TrainOpeningVariantListProps {
  variants: TrainOpeningVariantItem[];
  onTrainVariantNormal: (variantName: string) => void;
  onTrainVariantFocus: (variantName: string) => void;
}

const formatDueLabel = (dueAt?: Date): string => {
  if (!dueAt) {
    return "Due now";
  }
  const now = new Date();
  if (dueAt.getTime() <= now.getTime()) {
    return "Due now";
  }
  return `Due ${dueAt.toLocaleDateString()}`;
};

const getStatusVariant = (
  variant: TrainOpeningVariantItem
): "success" | "warning" | "danger" | "brand" => {
  if (variant.masteryScore >= 85 && variant.dailyErrorCount === 0) {
    return "success";
  }
  if (variant.dailyErrorCount > 0) {
    return "danger";
  }
  if (variant.masteryScore >= 55) {
    return "brand";
  }
  return "warning";
};

export const TrainOpeningVariantList: React.FC<TrainOpeningVariantListProps> = ({
  variants,
  onTrainVariantNormal,
  onTrainVariantFocus,
}) => {
  return (
    <Card className="border-border-default bg-surface" padding="default" elevation="raised">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-base">Variants</h3>
          <span className="text-xs text-text-subtle">{variants.length} total</span>
        </div>
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.variantName}
              className="rounded-lg border border-border-subtle bg-surface-raised px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-text-base break-words">
                  {variant.variantName}
                </p>
                <Badge variant={getStatusVariant(variant)} size="sm">
                  Mastery {variant.masteryScore}%
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-text-muted sm:grid-cols-4">
                <span className="rounded border border-border-subtle bg-surface px-2 py-1">
                  {formatDueLabel(variant.dueAt)}
                </span>
                <span className="rounded border border-border-subtle bg-surface px-2 py-1">
                  Errors {variant.dailyErrorCount}
                </span>
                <span className="rounded border border-border-subtle bg-surface px-2 py-1">
                  Streak {variant.perfectRunStreak}
                </span>
                <span className="rounded border border-border-subtle bg-surface px-2 py-1">
                  Rating {variant.lastRating || "none"}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => onTrainVariantNormal(variant.variantName)}
                  className="justify-center"
                >
                  Train Normal
                </Button>
                <Button
                  intent="accent"
                  size="sm"
                  onClick={() => onTrainVariantFocus(variant.variantName)}
                  className="justify-center"
                >
                  Train Focus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
