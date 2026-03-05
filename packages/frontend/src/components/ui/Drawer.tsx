import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

export interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-overlay backdrop-blur-sm">
      <button
        aria-label="Close drawer"
        className="flex-1 cursor-default"
        onClick={onClose}
      />
      <aside
        className={cn(
          "flex h-full w-full max-w-[28rem] flex-col border-l border-border-default bg-surface shadow-elevated",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text-base">{title}</h2>
            {description ? <p className="text-sm text-text-muted">{description}</p> : null}
          </div>
          <Button intent="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-border-subtle px-5 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
};
