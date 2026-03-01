import React from "react";
import { FilterType } from "../types";
import { Button } from "../../../../../components/ui";

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
        <Button
          key={value}
          intent={filter === value ? "primary" : "secondary"}
          size="xs"
          onClick={() => onFilterChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
