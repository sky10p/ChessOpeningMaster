import React from "react";
import { EyeIcon, PlayIcon } from "@heroicons/react/24/solid";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";

interface RepertoireCardProps {
  repertoire: IRepertoireDashboard;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainRepertoire: (repertoire: IRepertoireDashboard) => void;
  getTrainVariants: (repertoire: IRepertoireDashboard) => TrainVariant[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
}

export const RepertoireCard: React.FC<RepertoireCardProps> = ({
  repertoire,
  goToRepertoire,
  goToTrainRepertoire,
  getTrainVariants,
  getTrainVariantInfo,
}) => (
  <li
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
);
