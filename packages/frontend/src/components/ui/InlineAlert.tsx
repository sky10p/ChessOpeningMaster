import React from "react";
import { cn } from "../../utils/cn";

const variantClassName = {
  info: "border-info/20 bg-brand-subtle text-text-base",
  success: "border-success/20 bg-success/10 text-text-base",
  warning: "border-warning/20 bg-warning/10 text-text-base",
  danger: "border-danger/20 bg-danger/10 text-text-base",
};

export interface InlineAlertProps {
  title?: string;
  description: React.ReactNode;
  variant?: keyof typeof variantClassName;
  action?: React.ReactNode;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  title,
  description,
  variant = "info",
  action,
  className,
}) => {
  return (
    <div className={cn("rounded-xl border px-4 py-3", variantClassName[variant], className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <div className="text-sm text-text-muted">{description}</div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
};
