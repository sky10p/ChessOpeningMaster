import React from "react";
import { GlobalFilterState } from "../types";
import GamesFiltersFields from "./GamesFiltersFields";

type GamesFiltersDrawerProps = {
  show: boolean;
  filtersDraft: GlobalFilterState;
  setFiltersDraft: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  applyFiltersMobile: () => void;
  resetFilters: () => void;
  setShowMobileFilters: React.Dispatch<React.SetStateAction<boolean>>;
};

const GamesFiltersDrawer: React.FC<GamesFiltersDrawerProps> = ({
  show,
  filtersDraft,
  setFiltersDraft,
  applyFiltersMobile,
  resetFilters,
  setShowMobileFilters,
}) => {
  if (!show) {
    return null;
  }
  return (
    <div className="sm:hidden fixed inset-0 z-40 bg-slate-950/80 flex items-end">
      <div className="w-full rounded-t-2xl border-t border-slate-700 bg-slate-900 p-3 space-y-3 max-h-[82vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Filters</h3>
          <button className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-100" onClick={() => setShowMobileFilters(false)}>Close</button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <GamesFiltersFields filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 rounded bg-blue-600 text-sm" onClick={applyFiltersMobile}>Apply</button>
          <button className="flex-1 px-3 py-2 rounded bg-slate-700 text-sm" onClick={resetFilters}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default GamesFiltersDrawer;
