import React from "react";
import { VariantStatusCounts } from "@chess-opening-master/common";
import { Badge, type BadgeProps, Tooltip, getMasteryTier } from "../../../components/ui";
import { cn } from "../../../utils/cn";

type OverviewState = {
  label: "Needs Work" | "New" | "Ready";
  variant: "warning" | "brand" | "success";
  description: string;
};

interface RepertoireOverviewBadgeProps extends Omit<BadgeProps, "children"> {
  label: string;
  tooltip: React.ReactNode;
}

export const OVERVIEW_BADGE_CLASSNAMES = {
  openingsCount: "bg-surface-raised text-text-muted border-border-default",
  variantsCount: "bg-brand/12 text-brand border-brand/30",
  favorite: "bg-accent/15 text-accent border-accent/30",
  dueVariants: "bg-surface text-warning border-warning/40",
  mastery: "bg-surface-raised text-text-subtle border-border-default",
} as const;

export const getOverviewState = (
  statusCounts: VariantStatusCounts,
  dueMistakesCount: number
): OverviewState => {
  if (
    statusCounts.oneError > 0 ||
    statusCounts.twoErrors > 0 ||
    statusCounts.moreThanTwoErrors > 0 ||
    dueMistakesCount > 0
  ) {
    return {
      label: "Needs Work",
      variant: "warning",
      description:
        "This item has tracked error variants or scheduled mistake reviews. Prioritize it before relying on it.",
    };
  }

  if (statusCounts.unresolved > 0) {
    return {
      label: "New",
      variant: "brand",
      description:
        "This item still contains unpractised variants. The gray segment in the status bar shows those new lines.",
    };
  }

  return {
    label: "Ready",
    variant: "success",
    description:
      "All tracked variants here are practised, with no current error variants or unpractised lines.",
  };
};

export const getMasteryTooltip = (score: number) => {
  const tier = getMasteryTier(score);

  return (
    <span className="block space-y-1">
      <span className="block font-semibold text-text-base">{Math.round(score)}% mastery</span>
      <span className="block text-text-muted leading-snug">
        Current tier: {tier.label}. This score summarizes recent review and training performance
        for this item.
      </span>
    </span>
  );
};

export const getDueVariantsTooltip = () => (
  <span className="block space-y-1">
    <span className="block font-semibold text-text-base">Due variants</span>
    <span className="block text-text-muted leading-snug">
      These are normal spaced-repetition reviews scheduled for today or overdue.
    </span>
  </span>
);

export const getDueMistakesTooltip = () => (
  <span className="block space-y-1">
    <span className="block font-semibold text-text-base">Due mistakes</span>
    <span className="block text-text-muted leading-snug">
      These are scheduled mistake review prompts. They count mistake cards, not the number of error
      variants in the red bar segment, so the numbers can differ.
    </span>
  </span>
);

export const RepertoireOverviewBadge: React.FC<RepertoireOverviewBadgeProps> = ({
  label,
  tooltip,
  className,
  variant,
  size,
  ...rest
}) => (
  <Tooltip
    content={tooltip}
    preferredPlacement="top"
    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
  >
    <Badge
      variant={variant}
      size={size}
      className={cn("cursor-help", className)}
      {...rest}
    >
      {label}
    </Badge>
  </Tooltip>
);

RepertoireOverviewBadge.displayName = "RepertoireOverviewBadge";
