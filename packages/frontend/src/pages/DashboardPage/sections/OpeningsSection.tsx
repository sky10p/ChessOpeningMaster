import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { OpeningCard } from "../components/OpeningCard";
import { OpeningCardSkeleton } from "../components/OpeningCardSkeleton";
import { getVariantsProgressInfo } from "../../../components/design/SelectTrainVariants/utils";
import { RepertoireFilterDropdown } from "../components/RepertoireFilterDropdown";
import { Input, Select } from "../../../components/ui";
import {
  buildDashboardOpeningIndex,
  getScopedTrainVariantInfoKey,
  getOpeningRepertoires,
  getOpeningTrainVariants,
  toScopedTrainVariantInfoMap,
} from "../utils/openingIndex";

interface OpeningsSectionProps {
  openingNameFilter: string;
  setOpeningNameFilter: (value: string) => void;
  initialStatusFilter?: "all" | "errors" | "successful" | "new";
  filteredRepertoires: IRepertoireDashboard[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainOpening: (repertoire: IRepertoireDashboard, openingName: string) => void;
  loading?: boolean;
}

export const OpeningsSection: React.FC<OpeningsSectionProps> = ({
  openingNameFilter,
  setOpeningNameFilter,
  initialStatusFilter = "all",
  filteredRepertoires,
  getTrainVariantInfo,
  goToRepertoire,
  goToTrainOpening,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [orientationFilter, setOrientationFilter] = useState<'all' | 'white' | 'black'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'successful' | 'new'>(initialStatusFilter);
  const [selectedRepertoires, setSelectedRepertoires] = useState<string[]>([]);

  const hasReceivedData = useRef(false);
  const [ready, setReady] = useState(filteredRepertoires.length > 0);

  useEffect(() => {
    if (!hasReceivedData.current && (filteredRepertoires.length > 0 || !loading)) {
      hasReceivedData.current = true;
      setReady(true);
    }
  }, [filteredRepertoires, loading]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const isLoading = loading || !ready;

  const INITIAL_BATCH = 10;
  const BATCH_SIZE = 16;
  const BATCH_DELAY_MS = 80;
  const openingIndex = useMemo(
    () => buildDashboardOpeningIndex(filteredRepertoires),
    [filteredRepertoires]
  );

  const getVariantsByOrientation = useCallback((opening: string) => {
    return getOpeningTrainVariants(openingIndex, opening, orientationFilter);
  }, [openingIndex, orientationFilter]);

  const getVariantInfoByOrientation = useCallback((opening: string) => {
    const variants = getVariantsByOrientation(opening);
    const infos = variants.flatMap(({ repertoire }) => repertoire.variantsInfo || []);
    const infoMap = toScopedTrainVariantInfoMap(infos);
    return { variants, infoMap };
  }, [getVariantsByOrientation]);

  const filteredRepertoireCountByOrientation = useMemo(() => {
    if (orientationFilter === "all") {
      return filteredRepertoires.length;
    }
    return filteredRepertoires.filter(
      (repertoire) => repertoire.orientation === orientationFilter
    ).length;
  }, [filteredRepertoires, orientationFilter]);

  const filterByStatus = useCallback((opening: string) => {
    if (statusFilter === 'all') return true;
    const { variants, infoMap } = getVariantInfoByOrientation(opening);
    const { hasErrors, hasNewVariants } = getVariantsProgressInfo(
      variants,
      infoMap,
      (variant) =>
        getScopedTrainVariantInfoKey(
          (variant as typeof variants[number]).repertoire._id,
          variant.variant.fullName
        )
    );
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
    return getOpeningRepertoires(openingIndex, opening, orientationFilter).length > 0;
  }, [openingIndex, orientationFilter]);
  
  const filterByRepertoire = useCallback((opening: string) => {
    if (selectedRepertoires.length === 0) return false;
    if (selectedRepertoires.length === filteredRepertoireCountByOrientation) return true;
    
    return getOpeningRepertoires(openingIndex, opening, orientationFilter).some((repertoire) =>
      selectedRepertoires.includes(repertoire._id)
    );
  }, [selectedRepertoires, filteredRepertoireCountByOrientation, openingIndex, orientationFilter]);

  const filteredOpenings = useMemo(
    () =>
      openingIndex.openings
        .filter(o => o.toLowerCase().includes(openingNameFilter.toLowerCase()))
        .filter(filterByStatus)
        .filter(filterByOrientation)
        .filter(filterByRepertoire),
    [openingIndex, openingNameFilter, filterByStatus, filterByOrientation, filterByRepertoire]
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
    () => toScopedTrainVariantInfoMap(allVariantsInfo),
    [allVariantsInfo]
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
      <div className="sticky top-12 sm:top-16 z-40 bg-page pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-border-subtle">
        <header className="mb-2">
          <h2 className="font-bold text-text-base text-lg sm:text-2xl leading-tight mb-1 truncate">Openings</h2>
          <p className="text-text-muted text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Browse your prepared openings and see which repertoires use them. Filter by color, status, or name.</p>
        </header>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="md:w-40">
            <Select
              label="Color"
              size="sm"
              value={orientationFilter}
              onChange={(e) => setOrientationFilter(e.target.value as 'all' | 'white' | 'black')}
            >
              <option value="all">All</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </Select>
          </div>

          <div className="md:w-44">
            <Select
              label="Status"
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'errors' | 'successful' | 'new')}
            >
              <option value="all">All</option>
              <option value="errors">With Errors</option>
              <option value="successful">Successful</option>
              <option value="new">New Variants</option>
            </Select>
          </div>

          <div className="md:min-w-[16rem]">
            <div className="mb-1 text-sm font-medium text-text-muted">Repertoires</div>
            <RepertoireFilterDropdown
              filteredRepertoires={filteredRepertoires}
              orientationFilter={orientationFilter}
              selectedRepertoires={selectedRepertoires}
              setSelectedRepertoires={setSelectedRepertoires}
            />
          </div>

          <div className="flex-1">
            <Input
              label="Opening name"
              size="sm"
              placeholder="Filter openings"
              value={openingNameFilter}
              onChange={(e) => setOpeningNameFilter(e.target.value)}
            />
          </div>
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
                  const repertoiresWithOpening = getOpeningRepertoires(
                    openingIndex,
                    opening,
                    orientationFilter
                  );
                  const summaryVariants = getVariantsByOrientation(opening);
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
                      goToTrainOpening={goToTrainOpening}
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
