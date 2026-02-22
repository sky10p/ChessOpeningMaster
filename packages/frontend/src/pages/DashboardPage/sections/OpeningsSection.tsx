import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../models/VariantNode";
import { OpeningCard } from "../components/OpeningCard";
import { OpeningCardSkeleton } from "../components/OpeningCardSkeleton";
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
  loading?: boolean;
}

export const OpeningsSection: React.FC<OpeningsSectionProps> = ({
  openingNameFilter,
  setOpeningNameFilter,
  openings,
  filteredRepertoires,
  getTrainVariantInfo,
  goToRepertoire,
  goToTrainRepertoire,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [orientationFilter, setOrientationFilter] = useState<'all' | 'white' | 'black'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'successful' | 'new'>('all');
  const [selectedRepertoires, setSelectedRepertoires] = useState<string[]>([]);

  const hasReceivedData = useRef(false);
  const [ready, setReady] = useState(filteredRepertoires.length > 0);

  useEffect(() => {
    if (!hasReceivedData.current && (filteredRepertoires.length > 0 || !loading)) {
      hasReceivedData.current = true;
      setReady(true);
    }
  }, [filteredRepertoires, loading]);

  const isLoading = loading || !ready;

  const INITIAL_BATCH = 10;
  const BATCH_SIZE = 16;
  const BATCH_DELAY_MS = 80;

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

  const filteredOpenings = useMemo(
    () =>
      openings
        .filter(o => o.toLowerCase().includes(openingNameFilter.toLowerCase()))
        .filter(filterByStatus)
        .filter(filterByOrientation)
        .filter(filterByRepertoire),
    [openings, openingNameFilter, filterByStatus, filterByOrientation, filterByRepertoire]
  );

  const filteredOpeningsSignature = useMemo(
    () => filteredOpenings.join("||"),
    [filteredOpenings]
  );

  const allVariantsInfo = useMemo(
    () => filteredRepertoires.flatMap((repertoire) => repertoire.variantsInfo || []),
    [filteredRepertoires]
  );

  const summaryVariantInfo = useMemo(
    () => getTrainVariantInfo(allVariantsInfo),
    [allVariantsInfo, getTrainVariantInfo]
  );

  const [renderedCount, setRenderedCount] = useState(INITIAL_BATCH);

  useEffect(() => {
    setRenderedCount(INITIAL_BATCH);
  }, [filteredOpeningsSignature]);

  useEffect(() => {
    if (isLoading || renderedCount >= filteredOpenings.length) return;
    const id = window.setTimeout(() =>
      setRenderedCount(c => Math.min(c + BATCH_SIZE, filteredOpenings.length))
    , BATCH_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [renderedCount, filteredOpenings.length, isLoading]);

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="sticky top-12 sm:top-16 z-10 bg-page pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-border-subtle">
        <header className="mb-2">
          <h2 className="font-bold text-text-base text-lg sm:text-2xl leading-tight mb-1 truncate">Openings</h2>
          <p className="text-text-muted text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Browse your prepared openings and see which repertoires use them. Filter by color, status, or name.</p>
        </header>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <select
            value={orientationFilter}
            onChange={(e) => setOrientationFilter(e.target.value as 'all' | 'white' | 'black')}
            className="bg-surface-raised text-text-base px-3 py-2 border border-border-default rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 text-xs sm:text-sm"
          >
            <option value="all">All</option>
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'errors' | 'successful' | 'new')}
            className="bg-surface-raised text-text-base px-3 py-2 border border-border-default rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 text-xs sm:text-sm"
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
            className="bg-surface-raised text-text-base px-3 py-2 border border-border-default rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 flex-grow text-xs sm:text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 sm:pt-4 px-1 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <OpeningCardSkeleton key={i} />
              ))
            : (
              <>
                {filteredOpenings.slice(0, renderedCount).map((opening) => {
                  const repertoiresWithOpening = filteredRepertoires.filter((repertoire) =>
                    (orientationFilter === 'all' || repertoire.orientation === orientationFilter) &&
                    repertoire.moveNodes
                      ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
                          .getVariants()
                          .some((v) => v.name === opening)
                      : false
                  );
                  const summaryVariants = getVariantsByOrientation(filteredRepertoires, opening);
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
              </>
            )}
        </div>
      </div>
    </section>
  );
};
