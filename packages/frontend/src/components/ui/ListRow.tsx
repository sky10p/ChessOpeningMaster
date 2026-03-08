import React from "react";
import { cn } from "../../utils/cn";

export interface ListRowProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  description,
  meta,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-semibold text-text-base sm:text-base">{title}</div>
        {description ? <div className="text-sm text-text-muted">{description}</div> : null}
        {meta ? <div className="flex flex-wrap items-center gap-2 text-xs text-text-subtle">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
