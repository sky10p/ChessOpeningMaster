import React from "react";
import { RepertoireCard } from "../components/RepertoireCard";
import { getVariantsProgressInfo } from '../../../components/design/SelectTrainVariants/utils';
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";

interface RepertoiresSectionProps {
  orientationFilter: "all" | "white" | "black";
  setOrientationFilter: (value: "all" | "white" | "black") => void;
  repertoireNameFilter: string;
  setRepertoireNameFilter: (value: string) => void;
  nameFilteredRepertoires: IRepertoireDashboard[];
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainRepertoire: (repertoire: IRepertoireDashboard) => void;
  getTrainVariants: (repertoire: IRepertoireDashboard) => TrainVariant[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
}

export const RepertoiresSection: React.FC<RepertoiresSectionProps> = ({
  orientationFilter,
  setOrientationFilter,
  repertoireNameFilter,
  setRepertoireNameFilter,
  nameFilteredRepertoires,
  goToRepertoire,
  goToTrainRepertoire,
  getTrainVariants,
  getTrainVariantInfo,
}) => {
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'errors' | 'successful' | 'new'>('all');

  const repertoireProgressInfo = React.useMemo(() => {
    const map = new Map<string, ReturnType<typeof getVariantsProgressInfo>>();
    nameFilteredRepertoires.forEach(repertoire => {
      const info = getTrainVariantInfo(repertoire.variantsInfo || []);
      const variants = getTrainVariants(repertoire);
      map.set(repertoire._id, getVariantsProgressInfo(variants, info));
    });
    return map;
  }, [nameFilteredRepertoires, getTrainVariantInfo, getTrainVariants]);

  const filterByStatus = React.useCallback((repertoire: IRepertoireDashboard) => {
    if (statusFilter === 'all') return true;
    const progress = repertoireProgressInfo.get(repertoire._id);
    if (!progress) return true;
    const { hasErrors, hasNewVariants } = progress;
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
  }, [statusFilter, repertoireProgressInfo]);

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="sticky top-12 sm:top-16 z-10 bg-primary pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-gray-800">
        <header className="mb-2">
          <h2 className="font-bold text-gray-100 text-lg sm:text-2xl leading-tight mb-1 truncate">Repertoires</h2>
          <p className="text-gray-300 text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Manage and review your chess repertoires. Filter by color or name to quickly find what you need.</p>
        </header>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <select
            value={orientationFilter}
            onChange={(e) => setOrientationFilter(e.target.value as "all" | "white" | "black")}
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
          <input
            type="text"
            placeholder="Filter repertoires"
            value={repertoireNameFilter}
            onChange={(e) => setRepertoireNameFilter(e.target.value)}
            className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 flex-grow text-xs sm:text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 sm:pt-4 px-1 sm:px-4">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {nameFilteredRepertoires.filter(filterByStatus).map((repertoire) => (
            <RepertoireCard
              key={repertoire._id}
              repertoire={repertoire}
              goToRepertoire={goToRepertoire}
              goToTrainRepertoire={goToTrainRepertoire}
              getTrainVariants={getTrainVariants}
              getTrainVariantInfo={getTrainVariantInfo}
            />
          ))}
        </ul>
      </div>
    </section>
  );
};
