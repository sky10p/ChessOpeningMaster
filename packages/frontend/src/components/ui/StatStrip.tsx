import React from "react";
import { cn } from "../../utils/cn";

export interface StatStripItem {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "brand" | "accent" | "success" | "warning" | "danger";
  detail?: React.ReactNode;
}

const toneClassName: Record<NonNullable<StatStripItem["tone"]>, string> = {
  default: "text-text-base",
  brand: "text-brand",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export interface StatStripProps {
  items: StatStripItem[];
  className?: string;
}

export const StatStrip: React.FC<StatStripProps> = ({ items, className }) => {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-subtle">{item.label}</p>
          <p className={cn("mt-2 text-2xl font-semibold leading-none", toneClassName[item.tone ?? "default"])}>
            {item.value}
          </p>
          {item.detail ? <div className="mt-2 text-sm text-text-muted">{item.detail}</div> : null}
        </div>
      ))}
    </div>
  );
};
