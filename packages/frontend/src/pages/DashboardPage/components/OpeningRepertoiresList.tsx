import React from "react";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../models/VariantNode";

interface OpeningRepertoiresListProps {
  opening: string;
  repertoiresWithOpening: IRepertoireDashboard[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainRepertoire?: (repertoire: IRepertoireDashboard) => void;
}

export const OpeningRepertoiresList: React.FC<OpeningRepertoiresListProps> = ({
  opening,
  repertoiresWithOpening,
  getTrainVariantInfo,
  goToRepertoire,
  goToTrainRepertoire,
}) => (
  <div className="flex flex-col gap-2 mt-2">
    {repertoiresWithOpening.map((r) => {
      const variants = r.moveNodes
        ? MoveVariantNode.initMoveVariantNode(r.moveNodes)
            .getVariants()
            .filter((v) => v.name === opening)
            .map((v) => ({ variant: v, state: "inProgress" as const }))
        : [];
      const variantInfo = getTrainVariantInfo(r.variantsInfo);
      return (
        <div key={r._id} className="flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-1">
          <span
            className="cursor-pointer font-medium text-text-base hover:underline"
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
          {goToTrainRepertoire && (
            <button
              className="ml-1 px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => goToTrainRepertoire(r)}
            >
              Train
            </button>
          )}
          <div className="flex-1">
            <VariantsProgressBar
              variants={variants}
              variantInfo={variantInfo}
            />
          </div>
        </div>
      );
    })}
    {repertoiresWithOpening.length === 0 && (
      <div className="text-text-subtle text-xs text-center">No repertoires</div>
    )}
  </div>
);
