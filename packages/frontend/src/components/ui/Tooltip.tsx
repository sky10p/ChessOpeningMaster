import React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

type TooltipPlacement = "top" | "bottom";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  panelClassName?: string;
  preferredPlacement?: TooltipPlacement;
}

type TooltipPosition = {
  top: number;
  left: number;
};

const OFFSET = 10;
const VIEWPORT_PADDING = 8;
const NATIVELY_FOCUSABLE_TAGS = new Set(["a", "button", "input", "select", "textarea", "details", "summary"]);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function isAlreadyFocusable(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false;
  if (typeof child.type === "string" && NATIVELY_FOCUSABLE_TAGS.has(child.type)) return true;
  return typeof (child.props as { tabIndex?: number }).tabIndex === "number";
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  className,
  panelClassName,
  preferredPlacement = "top",
}) => {
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const panelRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<TooltipPosition | null>(null);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;

    if (!trigger || !panel) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const hasRoomAbove = triggerRect.top >= panelRect.height + OFFSET + VIEWPORT_PADDING;
    const hasRoomBelow =
      window.innerHeight - triggerRect.bottom >= panelRect.height + OFFSET + VIEWPORT_PADDING;

    let placement = preferredPlacement;

    if (preferredPlacement === "top" && !hasRoomAbove && hasRoomBelow) {
      placement = "bottom";
    }

    if (preferredPlacement === "bottom" && !hasRoomBelow && hasRoomAbove) {
      placement = "top";
    }

    const maxLeft = window.innerWidth - panelRect.width - VIEWPORT_PADDING;
    const left = clamp(
      triggerRect.left + triggerRect.width / 2 - panelRect.width / 2,
      VIEWPORT_PADDING,
      Math.max(VIEWPORT_PADDING, maxLeft)
    );
    const top =
      placement === "top"
        ? Math.max(
            VIEWPORT_PADDING,
            triggerRect.top - panelRect.height - OFFSET
          )
        : Math.min(
            window.innerHeight - panelRect.height - VIEWPORT_PADDING,
            triggerRect.bottom + OFFSET
          );

    setPosition({ top, left });
  }, [preferredPlacement]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleUpdate = () => updatePosition();
    const rafId = window.requestAnimationFrame(handleUpdate);

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [open, updatePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-flex", className)}
        tabIndex={isAlreadyFocusable(children) ? undefined : 0}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        {children}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={panelRef}
              id={tooltipId}
              role="tooltip"
              className={cn(
                "pointer-events-none fixed z-[80] w-64 rounded-lg border border-border-default bg-surface p-2.5 text-xs shadow-elevated",
                position ? "opacity-100" : "opacity-0",
                panelClassName
              )}
              style={
                position
                  ? {
                      top: position.top,
                      left: position.left,
                    }
                  : {
                      top: -9999,
                      left: -9999,
                    }
              }
            >
              {content}
            </span>,
            document.body
          )
        : null}
    </>
  );
};

Tooltip.displayName = "Tooltip";
