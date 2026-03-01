import React from "react";
import { FilterType } from "../types";

interface FilterButtonsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "white", label: "Only White" },
  { value: "black", label: "Only Black" },
  { value: "errors", label: "Only Errors" },
  { value: "unreviewed", label: "Only Unreviewed" },
];

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-2">
      {FILTER_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`px-3 py-1 rounded transition-colors duration-200 ${
            filter === value
              ? "bg-brand text-text-on-brand"
              : "bg-surface-raised text-text-muted hover:bg-interactive"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
