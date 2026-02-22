import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none",
  ],
  {
    variants: {
      intent: {
        primary:
          "bg-brand hover:bg-brand-hover text-text-on-brand",
        secondary:
          "bg-surface-raised hover:bg-interactive text-text-base border border-border-default",
        danger:
          "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-text-on-brand hover:border-danger",
        ghost:
          "text-text-muted hover:text-text-base hover:bg-interactive",
        accent:
          "bg-accent hover:bg-accent-hover text-text-on-brand",
        outline:
          "border border-border-default text-text-muted hover:border-brand hover:text-brand",
      },
      size: {
        xs:  "px-2 py-1 text-xs rounded-sm",
        sm:  "px-3 py-1.5 text-xs rounded-md",
        md:  "px-4 py-2 text-sm rounded-md",
        lg:  "px-5 py-2.5 text-base rounded-lg",
        xl:  "px-6 py-3 text-base rounded-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ intent, size }), className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
