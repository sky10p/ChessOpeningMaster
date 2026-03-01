import React from "react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  variant?: "card" | "inline";
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  variant = "card",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        variant === "card" && "rounded-xl border border-border-default bg-surface",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-interactive">
          <Icon className="h-6 w-6 text-text-muted" aria-hidden="true" />
        </div>
      )}

      <h3 className="mb-1 text-lg font-semibold text-text-base">{title}</h3>

      {description && <p className="mb-6 max-w-sm text-sm text-text-muted">{description}</p>}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
