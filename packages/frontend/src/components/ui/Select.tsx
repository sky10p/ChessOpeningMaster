import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const selectVariants = cva(
  [
    "w-full rounded-md border bg-surface text-text-base",
    "transition-colors appearance-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")] bg-right bg-no-repeat",
  ],
  {
    variants: {
      size: {
        sm: "pl-2.5 pr-8 py-1.5 text-xs",
        md: "pl-3 pr-9 py-2 text-sm",
        lg: "pl-4 pr-10 py-2.5 text-base",
      },
      state: {
        default: "border-border-default",
        error:   "border-danger focus-visible:ring-danger",
        success: "border-success",
      },
    },
    defaultVariants: {
      size:  "md",
      state: "default",
    },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  error?: boolean;
  label?: string;
  hint?: string;
  errorMessage?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, error, label, hint, errorMessage, id, style, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const derivedState = error ? "error" : "default";

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(selectVariants({ size, state: derivedState }), className)}
          style={{
            backgroundColor: "var(--color-bg-surface)",
            color: "var(--color-text-base)",
            borderColor: "var(--color-border-default)",
            ...style,
          }}
          aria-invalid={error}
          {...props}
        />
        {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
        {hint && !errorMessage && <p className="text-xs text-text-subtle">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
