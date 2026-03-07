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
  const titleId = React.useId();
  const descriptionId = React.useId();
  const drawerRef = React.useRef<HTMLElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    drawerRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-overlay backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close drawer"
        className="flex-1 cursor-default"
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "flex h-full w-full max-w-[28rem] flex-col border-l border-border-default bg-surface shadow-elevated focus:outline-none",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div className="space-y-1">
            <h2 id={titleId} className="text-xl font-semibold text-text-base">{title}</h2>
            {description ? <p id={descriptionId} className="text-sm text-text-muted">{description}</p> : null}
          </div>
          <Button type="button" intent="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-border-subtle px-5 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
};
