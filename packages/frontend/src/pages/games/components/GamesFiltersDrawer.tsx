import React from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
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
    <div className="sm:hidden fixed inset-0 z-40 flex items-end" style={{ backgroundColor: "rgba(2,6,23,0.75)" }}>
      <div className="w-full rounded-t-2xl border-t border-slate-700/80 bg-slate-900 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-slate-100">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold">Filters</h3>
          </div>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <GamesFiltersFields filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} />
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-slate-800 shrink-0">
          <button
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            onClick={applyFiltersMobile}
          >
            Apply Filters
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesFiltersDrawer;
