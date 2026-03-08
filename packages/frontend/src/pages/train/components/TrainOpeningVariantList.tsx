import React from "react";
import { TrainOpeningVariantItem } from "@chess-opening-master/common";
import { Badge, Button, Card, EmptyState, ListRow, SectionHeader } from "../../../components/ui";

interface TrainOpeningVariantListProps {
  variants: TrainOpeningVariantItem[];
  onViewVariant: (variantName: string) => void;
  onTrainVariantNormal: (variantName: string) => void;
  onTrainVariantFocus: (variantName: string) => void;
  compact?: boolean;
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
  onViewVariant,
  onTrainVariantNormal,
  onTrainVariantFocus,
  compact = false,
}) => {
  return (
    <Card className="border-border-default bg-surface" padding="relaxed" elevation="raised">
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Variants"
          description={
            compact
              ? undefined
              : "Use targeted training when one line needs extra repetition instead of rerunning the whole opening."
          }
          action={<span className="text-xs text-text-subtle">{variants.length} total</span>}
        />
        {variants.length === 0 ? (
          <EmptyState
            variant="inline"
            title="No variants available"
            description="This opening does not have trainable variants yet."
          />
        ) : (
          <div className="space-y-3">
            {variants.map((variant) => (
              <ListRow
                key={variant.variantName}
                className="bg-surface-raised"
                title={
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-words">{variant.variantName}</span>
                    <Badge variant={getStatusVariant(variant)} size="sm">
                      Mastery {variant.masteryScore}%
                    </Badge>
                  </div>
                }
                description={
                  <span className="leading-6">
                    {formatDueLabel(variant.dueAt)}.{" "}
                    {variant.dailyErrorCount > 0
                      ? `${variant.dailyErrorCount} active errors to revisit.`
                      : compact
                        ? "Line ready for review."
                        : "No active daily errors."}
                  </span>
                }
                meta={
                  compact ? undefined : (
                    <>
                      <Badge variant="default" size="sm">
                        Streak {variant.perfectRunStreak}
                      </Badge>
                      <Badge variant={variant.dailyErrorCount > 0 ? "danger" : "success"} size="sm">
                        Errors {variant.dailyErrorCount}
                      </Badge>
                      <Badge variant="info" size="sm">
                        Rating {variant.lastRating || "none"}
                      </Badge>
                    </>
                  )
                }
                actions={
                  compact ? (
                    <>
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => onTrainVariantNormal(variant.variantName)}
                        className="w-full justify-center sm:w-auto"
                      >
                        Train variant
                      </Button>
                      <Button
                        intent="ghost"
                        size="sm"
                        onClick={() => onViewVariant(variant.variantName)}
                        className="w-full justify-center sm:w-auto"
                      >
                        Open line
                      </Button>
                      <Button
                        intent="outline"
                        size="sm"
                        onClick={() => onTrainVariantFocus(variant.variantName)}
                        className="w-full justify-center sm:w-auto"
                      >
                        Focus mistakes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        intent="ghost"
                        size="sm"
                        onClick={() => onViewVariant(variant.variantName)}
                        className="justify-center"
                      >
                        Open line
                      </Button>
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => onTrainVariantNormal(variant.variantName)}
                        className="justify-center"
                      >
                        Train variant
                      </Button>
                      <Button
                        intent="accent"
                        size="sm"
                        onClick={() => onTrainVariantFocus(variant.variantName)}
                        className="justify-center"
                      >
                        Focus mistakes
                      </Button>
                    </>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
