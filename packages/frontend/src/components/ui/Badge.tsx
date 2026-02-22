import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full",
  {
    variants: {
      variant: {
        default:  "bg-surface-raised text-text-muted border border-border-default",
        brand:    "bg-brand/15 text-brand border border-brand/30",
        success:  "bg-success/15 text-success border border-success/30",
        warning:  "bg-warning/15 text-warning border border-warning/30",
        danger:   "bg-danger/15 text-danger border border-danger/30",
        info:     "bg-sky-500/15 text-sky-400 border border-sky-500/30",
        accent:   "bg-accent/15 text-accent border border-accent/30",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px] gap-0.5",
        md: "px-2 py-0.5 text-xs gap-1",
        lg: "px-2.5 py-1 text-sm gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
);

Badge.displayName = "Badge";
