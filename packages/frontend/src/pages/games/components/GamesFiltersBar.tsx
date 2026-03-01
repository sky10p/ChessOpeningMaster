import React from "react";
import { GlobalFilterState } from "../types";
import GamesFiltersFields from "./GamesFiltersFields";
import { Button } from "../../../components/ui";

type GamesFiltersBarProps = {
  filtersDraft: GlobalFilterState;
  setFiltersDraft: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  applyFilters: () => void;
  resetFilters: () => void;
};

const GamesFiltersBar: React.FC<GamesFiltersBarProps> = ({ filtersDraft, setFiltersDraft, applyFilters, resetFilters }) => (
  <section className="hidden sm:block px-4 py-2.5 border-b border-border-default bg-surface">
    <div className="flex flex-wrap items-end gap-2">
      <GamesFiltersFields filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} />
      <div className="flex gap-1.5 ml-auto shrink-0">
        <Button intent="primary" size="xs" onClick={applyFilters}>Apply Filters</Button>
        <Button intent="secondary" size="xs" onClick={resetFilters}>Reset</Button>
      </div>
    </div>
  </section>
);

export default GamesFiltersBar;
