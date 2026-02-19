import React from "react";
import { GlobalFilterState } from "../types";
import GamesFiltersFields from "./GamesFiltersFields";

type GamesFiltersBarProps = {
  filtersDraft: GlobalFilterState;
  setFiltersDraft: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  applyFilters: () => void;
  resetFilters: () => void;
};

const GamesFiltersBar: React.FC<GamesFiltersBarProps> = ({ filtersDraft, setFiltersDraft, applyFilters, resetFilters }) => (
  <section className="hidden sm:block p-3 border-b border-slate-800 bg-slate-900/70">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
      <GamesFiltersFields filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} />
      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 rounded bg-blue-600 text-sm" onClick={applyFilters}>Apply</button>
        <button className="flex-1 px-3 py-2 rounded bg-slate-700 text-sm" onClick={resetFilters}>Reset</button>
      </div>
    </div>
  </section>
);

export default GamesFiltersBar;
