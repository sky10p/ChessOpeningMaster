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
  <section className="hidden sm:block px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
    <div className="flex flex-wrap items-end gap-2">
      <GamesFiltersFields filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} />
      <div className="flex gap-1.5 ml-auto shrink-0">
        <button
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          onClick={applyFilters}
        >
          Apply
        </button>
        <button
          className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors border border-slate-600"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
    </div>
  </section>
);

export default GamesFiltersBar;
