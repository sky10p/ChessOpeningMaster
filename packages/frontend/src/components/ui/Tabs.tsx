import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const tabButtonVariants = cva(
  [
    "flex items-center gap-1.5 whitespace-nowrap font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        underline: "px-4 py-3 text-sm border-b-2",
        pill:      "px-3 py-1.5 text-sm rounded-md",
        segment:   "flex-1 px-3 py-1.5 text-sm rounded-md justify-center",
      },
      active: {
        true:  "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "underline",
        active: true,
        className: "border-brand text-brand bg-interactive/40",
      },
      {
        variant: "underline",
        active: false,
        className: "border-transparent text-text-muted hover:text-text-base hover:bg-interactive/30",
      },
      {
        variant: "pill",
        active: true,
        className: "bg-brand text-text-on-brand",
      },
      {
        variant: "pill",
        active: false,
        className: "text-text-muted hover:text-text-base hover:bg-interactive",
      },
      {
        variant: "segment",
        active: true,
        className: "bg-brand text-text-on-brand shadow-surface",
      },
      {
        variant: "segment",
        active: false,
        className: "text-text-muted hover:text-text-base",
      },
    ],
    defaultVariants: {
      variant: "underline",
      active:  false,
    },
  }
);

export interface TabButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabButtonVariants> {}

export const TabButton = ({
  className,
  variant,
  active,
  ...props
}: TabButtonProps) => (
  <button
    role="tab"
    aria-selected={active ?? false}
    className={cn(tabButtonVariants({ variant, active }), className)}
    {...props}
  />
);

TabButton.displayName = "TabButton";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "underline" | "pill" | "segment";
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant = "underline", ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "flex items-stretch overflow-x-auto scrollbar-none",
        variant === "underline" && "bg-surface border-b border-border-default",
        variant === "pill"      && "gap-1 p-1",
        variant === "segment"   && "bg-surface-raised rounded-lg p-1 gap-1",
        className
      )}
      {...props}
    />
  )
);

Tabs.displayName = "Tabs";
