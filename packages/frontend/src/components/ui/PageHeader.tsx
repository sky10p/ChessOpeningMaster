import React from "react";
import { cn } from "../../utils/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryActions,
  meta,
  className,
}) => {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface px-4 py-5 shadow-surface sm:px-6",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-text-base sm:text-[2rem]">
              {title}
            </h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-6 text-text-muted sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>
      {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
    </header>
  );
};
