import React, { useState, useRef } from "react";
import { Badge, type BadgeProps } from "./Badge";

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
  Mastered: "Score \u2265 85%. Solid recall — keep refreshing occasionally.",
  "In Progress": "Score 55\u201384%. Building confidence — review regularly.",
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
  ...rest
}) => {
  const tier = getMasteryTier(score);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (!showTooltip) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <Badge variant={tier.variant} {...rest}>
        {children ?? tier.label}
      </Badge>
      {showTooltip && open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                     w-48 rounded-lg border border-border-default bg-surface
                     shadow-elevated p-2.5 text-xs pointer-events-none"
        >
          <span className="block font-semibold text-text-base mb-1">
            {tier.label} — {Math.round(score)}%
          </span>
          <span className="block text-text-muted leading-snug">
            {TIER_DESCRIPTIONS[tier.label]}
          </span>
        </span>
      )}
    </span>
  );
};

MasteryBadge.displayName = "MasteryBadge";
