import React from "react";

export interface MetricTitleProps {
  label: string;
  helpText: string;
}

export const MetricTitle: React.FC<MetricTitleProps> = ({ label, helpText }) => (
  <div className="text-xs text-text-muted flex items-center gap-1">
    {label}
    <span
      className="inline-flex items-center justify-center h-4 w-4 rounded-full border border-border-subtle text-text-subtle cursor-help text-[10px]"
      title={helpText}
    >
      ?
    </span>
  </div>
);
