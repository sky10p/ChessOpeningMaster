import React from "react";
import { cn } from "../../utils/cn";
import { Badge, type BadgeProps } from "./Badge";
import { Tooltip } from "./Tooltip";

type MasteryTier = {
  label: string;
  variant: "success" | "brand" | "warning";
};

const MASTERY_THRESHOLDS: readonly { min: number; tier: MasteryTier }[] = [
  { min: 85, tier: { label: "Mastered", variant: "success" } },
  { min: 55, tier: { label: "In Progress", variant: "brand" } },
  { min: 0, tier: { label: "Needs Work", variant: "warning" } },
];

export function getMasteryTier(score: number): MasteryTier {
  for (const entry of MASTERY_THRESHOLDS) {
    if (score >= entry.min) return entry.tier;
  }
  return MASTERY_THRESHOLDS[MASTERY_THRESHOLDS.length - 1].tier;
}

const TIER_DESCRIPTIONS: Record<string, string> = {
  Mastered: "Score >= 85%. Solid recall; keep refreshing occasionally.",
  "In Progress": "Score 55-84%. Building confidence; review regularly.",
  "Needs Work": "Score < 55%. Focus your practice here.",
};

export interface MasteryBadgeProps extends Omit<BadgeProps, "variant"> {
  score: number;
  showTooltip?: boolean;
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({
  score,
  showTooltip = true,
  children,
  className,
  ...rest
}) => {
  const tier = getMasteryTier(score);
  const badgeClassName =
    tier.variant === "success"
      ? "bg-success text-text-on-brand border-success shadow-sm"
      : "bg-surface/95 shadow-sm backdrop-blur-sm";

  const badge = (
    <Badge
      variant={tier.variant}
      className={cn(badgeClassName, className)}
      {...rest}
    >
      {children ?? tier.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      preferredPlacement="top"
      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      content={
        <span className="block space-y-1">
          <span className="block font-semibold text-text-base">
            {tier.label} - {Math.round(score)}%
          </span>
          <span className="block text-text-muted leading-snug">
            {TIER_DESCRIPTIONS[tier.label]}
          </span>
        </span>
      }
    >
      {badge}
    </Tooltip>
  );
};

MasteryBadge.displayName = "MasteryBadge";
