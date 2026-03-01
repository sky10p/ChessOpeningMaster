import React from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { GlobalFilterState } from "../types";
import GamesFiltersFields from "./GamesFiltersFields";
import { Button, IconButton } from "../../../components/ui";

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
      <div className="w-full rounded-t-2xl border-t border-border-subtle bg-surface shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border-default shrink-0">
          <div className="flex items-center gap-2 text-text-base">
            <FunnelIcon className="w-4 h-4 text-text-subtle" />
            <h3 className="text-sm font-semibold">Filters</h3>
          </div>
          <IconButton
            label="Close filters"
            onClick={() => setShowMobileFilters(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <GamesFiltersFields filtersDraft={filtersDraft} setFiltersDraft={setFiltersDraft} />
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-border-default shrink-0">
          <Button intent="primary" size="md" className="flex-1 justify-center" onClick={applyFiltersMobile}>Apply Filters</Button>
          <Button intent="secondary" size="md" className="flex-1 justify-center" onClick={resetFilters}>Reset</Button>
        </div>
      </div>
    </div>
  );
};

export default GamesFiltersDrawer;
