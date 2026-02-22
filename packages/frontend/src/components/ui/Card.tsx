import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const cardVariants = cva(
  "bg-surface border border-border-default rounded-lg transition-shadow",
  {
    variants: {
      padding: {
        none:    "",
        compact: "p-3",
        default: "p-4",
        relaxed: "p-6",
      },
      elevation: {
        flat:   "shadow-none",
        raised: "shadow-surface",
        high:   "shadow-elevated",
      },
      interactive: {
        true:  "cursor-pointer hover:shadow-elevated hover:border-border-default/80",
        false: "",
      },
    },
    defaultVariants: {
      padding:     "default",
      elevation:   "raised",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, elevation, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ padding, elevation, interactive }), className)}
      {...props}
    />
  )
);

Card.displayName = "Card";
