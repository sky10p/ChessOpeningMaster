import React from "react";
import { EyeIcon, PlayIcon } from "@heroicons/react/24/solid";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";

interface DashboardSectionProps {
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

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  orientationFilter,
  setOrientationFilter,
  repertoireNameFilter,
  setRepertoireNameFilter,
  nameFilteredRepertoires,
  goToRepertoire,
  goToTrainRepertoire,
  getTrainVariants,
  getTrainVariantInfo,
}) => (
  <section className="flex-1 flex flex-col min-h-0">
    <div className="sticky top-12 sm:top-16 z-10 bg-primary pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-gray-800">
      <header className="mb-2">
        <h2 className="font-bold text-gray-100 text-lg sm:text-2xl leading-tight mb-1 truncate">Dashboard</h2>
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
        {nameFilteredRepertoires.map((repertoire) => (
          <li
            key={repertoire._id}
            className="p-3 sm:p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-100 text-center truncate">{repertoire.name}</h3>
            <div className="flex space-x-2 mb-2 justify-center">
              <button
                className="flex items-center px-3 py-1 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => goToRepertoire(repertoire)}
              >
                <EyeIcon className="h-5 w-5 mr-1" />
                View
              </button>
              <button
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => goToTrainRepertoire(repertoire)}
              >
                <PlayIcon className="h-5 w-5 mr-1" />
                Train
              </button>
            </div>
            <VariantsProgressBar
              variants={getTrainVariants(repertoire)}
              variantInfo={getTrainVariantInfo(repertoire.variantsInfo)}
            />
          </li>
        ))}
      </ul>
    </div>
  </section>
);
