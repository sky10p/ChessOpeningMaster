import React, { useState } from "react";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../models/VariantNode";
import { OpeningCard } from "../components/OpeningCard";

interface OpeningsSectionProps {
  openingNameFilter: string;
  setOpeningNameFilter: (value: string) => void;
  openings: string[];
  filteredRepertoires: IRepertoireDashboard[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
}

const getAllVariantsForOpening = (filteredRepertoires: IRepertoireDashboard[], opening: string) => {
  return filteredRepertoires.flatMap((r) =>
    r.moveNodes
      ? MoveVariantNode.initMoveVariantNode(r.moveNodes)
          .getVariants()
          .filter((v) => v.name === opening)
          .map((v) => ({ variant: v, state: "inProgress" as const }))
      : []
  );
};

const getAllVariantInfoForOpening = (filteredRepertoires: IRepertoireDashboard[], getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>) => {
  const infos = filteredRepertoires.flatMap((r) => r.variantsInfo || []);
  return getTrainVariantInfo(infos);
};

export const OpeningsSection: React.FC<OpeningsSectionProps> = ({
  openingNameFilter,
  setOpeningNameFilter,
  openings,
  filteredRepertoires,
  getTrainVariantInfo,
  goToRepertoire,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
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
            .map((opening) => {
              const repertoiresWithOpening = filteredRepertoires.filter((repertoire) =>
                repertoire.moveNodes
                  ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
                      .getVariants()
                      .some((v) => v.name === opening)
                  : false
              );
              const summaryVariants = getAllVariantsForOpening(filteredRepertoires, opening);
              const summaryVariantInfo = getAllVariantInfoForOpening(filteredRepertoires, getTrainVariantInfo);
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
                  getTrainVariantInfo={getTrainVariantInfo}
                />
              );
            })}
        </div>
      </div>
    </section>
  );
};
