import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";

export interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  defaultOpen = true,
  badge,
  children,
  className,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-border-subtle rounded-lg bg-surface", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left
                   hover:bg-interactive/50 rounded-t-lg transition-colors focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-brand"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-text-base text-sm truncate">{title}</h3>
          {badge}
        </div>
        {subtitle && !open && (
          <span className="text-text-muted text-xs truncate hidden sm:block">{subtitle}</span>
        )}
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
};
