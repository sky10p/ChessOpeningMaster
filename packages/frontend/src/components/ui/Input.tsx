import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const inputVariants = cva(
  [
    "w-full rounded-md border bg-surface text-text-base placeholder:text-text-subtle",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-2.5 text-base",
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  label?: string;
  hint?: string;
  errorMessage?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, error, label, hint, errorMessage, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const derivedState = error ? "error" : "default";

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ size, state: derivedState }), className)}
          aria-invalid={error}
          {...props}
        />
        {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
        {hint && !errorMessage && <p className="text-xs text-text-subtle">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  label?: string;
  hint?: string;
  errorMessage?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, error, label, hint, errorMessage, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const derivedState = error ? "error" : "default";

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ size, state: derivedState }), className)}
          aria-invalid={error}
          {...props}
        />
        {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
        {hint && !errorMessage && <p className="text-xs text-text-subtle">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
