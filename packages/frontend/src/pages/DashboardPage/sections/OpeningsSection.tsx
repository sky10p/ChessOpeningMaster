import React from "react";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../models/VariantNode";
import { TrainVariant } from "../../../models/chess.models";

interface OpeningsSectionProps {
  openingNameFilter: string;
  setOpeningNameFilter: (value: string) => void;
  openings: string[];
  filteredRepertoires: IRepertoireDashboard[];
  getVariantsForOpening: (opening: string) => TrainVariant[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
}

export const OpeningsSection: React.FC<OpeningsSectionProps> = ({
  openingNameFilter,
  setOpeningNameFilter,
  openings,
  filteredRepertoires,
  getVariantsForOpening,
  getTrainVariantInfo,
  goToRepertoire,
}) => (
  <section className="flex-1 flex flex-col min-h-0">
    <div className="sticky top-12 sm:top-16 z-10 bg-primary pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-gray-800">
      <header className="mb-2">
        <h2 className="font-bold text-gray-100 text-lg sm:text-2xl leading-tight mb-1 truncate">Openings</h2>
        <p className="text-gray-300 text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Browse your prepared openings and see which repertoires use them.</p>
      </header>
      <input
        type="text"
        placeholder="Filter openings"
        value={openingNameFilter}
        onChange={(e) => setOpeningNameFilter(e.target.value)}
        className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 w-full text-xs sm:text-sm"
      />
    </div>
    <div className="flex-1 overflow-y-auto pt-2 sm:pt-4 px-1 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {openings
          .filter(opening => opening.toLowerCase().includes(openingNameFilter.toLowerCase()))
          .map((opening) => (
            <div
              key={opening}
              className="bg-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400"
            >
              <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-100 text-center truncate">{opening}</h3>
              <VariantsProgressBar
                variants={getVariantsForOpening(opening)}
                variantInfo={getTrainVariantInfo(filteredRepertoires.flatMap((r) => r.variantsInfo))}
              />
              <div className="mt-2 text-xs sm:text-sm text-gray-400 text-center flex flex-wrap justify-center gap-2">
                {filteredRepertoires
                  .filter((repertoire) =>
                    repertoire.moveNodes
                      ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
                          .getVariants()
                          .some((v) => v.name === opening)
                      : false
                  )
                  .map((r) => (
                    <div
                      key={r._id}
                      className="px-3 py-1 bg-gray-800 text-gray-100 rounded-lg inline-block cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => goToRepertoire(r)}
                    >
                      {r.name}
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  </section>
);
