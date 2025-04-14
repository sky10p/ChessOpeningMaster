import React from "react";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";
import { OpeningRepertoiresList } from "./OpeningRepertoiresList";

interface OpeningCardProps {
  opening: string;
  repertoiresWithOpening: IRepertoireDashboard[];
  summaryVariants: TrainVariant[];
  summaryVariantInfo: Record<string, TrainVariantInfo>;
  isOpen: boolean;
  repCount: number;
  onToggle: () => void;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
}

export const OpeningCard: React.FC<OpeningCardProps> = ({
  opening,
  repertoiresWithOpening,
  summaryVariants,
  summaryVariantInfo,
  isOpen,
  repCount,
  onToggle,
  goToRepertoire,
  getTrainVariantInfo,
}) => {
  if (repertoiresWithOpening.length === 1) {
    const r = repertoiresWithOpening[0];
    return (
      <div
        className="bg-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400"
      >
        <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-100 text-center truncate">{opening}</h3>
        <VariantsProgressBar
          variants={summaryVariants}
          variantInfo={summaryVariantInfo}
        />
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="flex items-center gap-2 justify-center">
            <span
              className="cursor-pointer font-medium text-gray-100 hover:underline"
              onClick={() => goToRepertoire(r)}
            >
              {r.name}
            </span>
            <button
              className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => goToRepertoire(r)}
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="bg-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400"
    >
      <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-100 text-center truncate">{opening}</h3>
      <VariantsProgressBar
        variants={summaryVariants}
        variantInfo={summaryVariantInfo}
      />
      <button
        className="mt-2 mb-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 self-center"
        onClick={onToggle}
      >
        {isOpen ? `Hide repertoires` : `Show ${repCount} repertoire${repCount > 1 ? 's' : ''}`}
      </button>
      {isOpen && (
        <OpeningRepertoiresList
          opening={opening}
          repertoiresWithOpening={repertoiresWithOpening}
          getTrainVariantInfo={getTrainVariantInfo}
          goToRepertoire={goToRepertoire}
        />
      )}
    </div>
  );
};
