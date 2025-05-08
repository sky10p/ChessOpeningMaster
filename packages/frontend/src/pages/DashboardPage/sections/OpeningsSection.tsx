import React, { useState, useCallback } from "react";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../models/VariantNode";
import { OpeningCard } from "../components/OpeningCard";
import { getVariantsProgressInfo } from "../../../components/design/SelectTrainVariants/utils";
import { RepertoireFilterDropdown } from "../components/RepertoireFilterDropdown";

interface OpeningsSectionProps {
  openingNameFilter: string;
  setOpeningNameFilter: (value: string) => void;
  openings: string[];
  filteredRepertoires: IRepertoireDashboard[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainRepertoire: (repertoire: IRepertoireDashboard) => void;
}

export const OpeningsSection: React.FC<OpeningsSectionProps> = ({
  openingNameFilter,
  setOpeningNameFilter,
  openings,
  filteredRepertoires,
  getTrainVariantInfo,
  goToRepertoire,
  goToTrainRepertoire,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [orientationFilter, setOrientationFilter] = useState<'all' | 'white' | 'black'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'successful' | 'new'>('all');
  const [selectedRepertoires, setSelectedRepertoires] = useState<string[]>([]);

  const getVariantsByOrientation = useCallback((repertoires: IRepertoireDashboard[], opening: string) => {
    return repertoires
      .filter((r) => orientationFilter === 'all' || r.orientation === orientationFilter)
      .flatMap((r) => {
        if (!r.moveNodes) return [];
        const variants = MoveVariantNode.initMoveVariantNode(r.moveNodes).getVariants();
        return variants.filter((v) => v.name === opening).map((v) => ({ variant: v, state: 'inProgress' as const, repertoire: r }));
      });
  }, [orientationFilter]);

  const getVariantInfoByOrientation = useCallback((repertoires: IRepertoireDashboard[], opening: string) => {
    const variants = getVariantsByOrientation(repertoires, opening);
    const infos = repertoires.flatMap((r) => r.variantsInfo || []);
    const infoMap = getTrainVariantInfo(infos);
    return { variants, infoMap };
  }, [getTrainVariantInfo, getVariantsByOrientation]);

  const filterByStatus = useCallback((opening: string) => {
    if (statusFilter === 'all') return true;
    const { variants, infoMap } = getVariantInfoByOrientation(filteredRepertoires, opening);
    const { hasErrors, hasNewVariants } = getVariantsProgressInfo(variants, infoMap);
    if (statusFilter === 'errors') {
      return hasErrors;
    }
    if (statusFilter === 'successful') {
      return !hasErrors && !hasNewVariants;
    }
    if (statusFilter === 'new') {
      return hasNewVariants;
    }
    return true;
  }, [statusFilter, filteredRepertoires, getVariantInfoByOrientation]);

  const filterByOrientation = useCallback((opening: string) => {
    if (orientationFilter === 'all') return true;
    return filteredRepertoires.some(repertoire => 
      repertoire.orientation === orientationFilter && 
      repertoire.moveNodes && 
      MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
        .getVariants()
        .some(v => v.name === opening)
    );
  }, [orientationFilter, filteredRepertoires]);
  
  const filterByRepertoire = useCallback((opening: string) => {
    if (selectedRepertoires.length === 0) return false;
    if (selectedRepertoires.length === filteredRepertoires.length) return true;
    
    return filteredRepertoires.some(repertoire => 
      selectedRepertoires.includes(repertoire._id) &&
      repertoire.moveNodes &&
      MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
        .getVariants()
        .some(v => v.name === opening)
    );
  }, [selectedRepertoires, filteredRepertoires]);

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="sticky top-12 sm:top-16 z-10 bg-primary pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-gray-800">
        <header className="mb-2">
          <h2 className="font-bold text-gray-100 text-lg sm:text-2xl leading-tight mb-1 truncate">Openings</h2>
          <p className="text-gray-300 text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Browse your prepared openings and see which repertoires use them. Filter by color, status, or name.</p>
        </header>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <select
            value={orientationFilter}
            onChange={(e) => setOrientationFilter(e.target.value as 'all' | 'white' | 'black')}
            className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 text-xs sm:text-sm"
          >
            <option value="all">All</option>
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'errors' | 'successful' | 'new')}
            className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 text-xs sm:text-sm"
          >
            <option value="all">All</option>
            <option value="errors">With Errors</option>
            <option value="successful">Successful</option>
            <option value="new">New Variants</option>
          </select>
          
          <RepertoireFilterDropdown
            filteredRepertoires={filteredRepertoires}
            orientationFilter={orientationFilter}
            selectedRepertoires={selectedRepertoires}
            setSelectedRepertoires={setSelectedRepertoires}
          />
          
          <input
            type="text"
            placeholder="Filter openings"
            value={openingNameFilter}
            onChange={(e) => setOpeningNameFilter(e.target.value)}
            className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 flex-grow text-xs sm:text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 sm:pt-4 px-1 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {openings
            .filter(opening => opening.toLowerCase().includes(openingNameFilter.toLowerCase()))
            .filter(filterByStatus)
            .filter(filterByOrientation)
            .filter(filterByRepertoire)
            .map((opening) => {
              const repertoiresWithOpening = filteredRepertoires.filter((repertoire) =>
                (orientationFilter === 'all' || repertoire.orientation === orientationFilter) &&
                repertoire.moveNodes
                  ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
                      .getVariants()
                      .some((v) => v.name === opening)
                  : false
              );
              const summaryVariants = getVariantsByOrientation(filteredRepertoires, opening);
              const variantsInfo = filteredRepertoires.flatMap((r) => r.variantsInfo || []);
              const summaryVariantInfo = getTrainVariantInfo(variantsInfo);
              const isOpen = expanded[opening] || false;
              const repCount = repertoiresWithOpening.length;
              return (
                <OpeningCard
                  key={opening}
                  opening={opening}
                  repertoiresWithOpening={repertoiresWithOpening}
                  summaryVariants={summaryVariants}
                  summaryVariantInfo={summaryVariantInfo}
                  isOpen={isOpen}
                  repCount={repCount}
                  onToggle={() => setExpanded((prev) => ({ ...prev, [opening]: !isOpen }))}
                  goToRepertoire={goToRepertoire}
                  goToTrainRepertoire={goToTrainRepertoire}
                  getTrainVariantInfo={getTrainVariantInfo}
                />
              );
            })}
        </div>
      </div>
    </section>
  );
};
