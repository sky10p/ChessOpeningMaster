import React from "react";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { getRepertoireVariants } from "../utils/openingIndex";
import { Button } from "../../../components/ui";

interface OpeningRepertoiresListProps {
  opening: string;
  repertoiresWithOpening: IRepertoireDashboard[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainOpening?: (repertoire: IRepertoireDashboard, openingName: string) => void;
}

export const OpeningRepertoiresList: React.FC<OpeningRepertoiresListProps> = ({
  opening,
  repertoiresWithOpening,
  getTrainVariantInfo,
  goToRepertoire,
  goToTrainOpening,
}) => (
  <div className="flex flex-col gap-2 mt-2">
    {repertoiresWithOpening.map((r) => {
      const variants = getRepertoireVariants(r)
        .filter((variant) => variant.name === opening)
        .map((variant) => ({ variant, state: "inProgress" as const }));
      const variantInfo = getTrainVariantInfo(r.variantsInfo);
      return (
        <div key={r._id} className="flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-1">
          <span
            className="cursor-pointer font-medium text-text-base hover:underline"
            onClick={() => goToRepertoire(r)}
          >
            {r.name}
          </span>
          <Button intent="primary" size="xs" className="ml-1" onClick={() => goToRepertoire(r)}>View</Button>
          {goToTrainOpening && (
            <Button intent="accent" size="xs" className="ml-1" onClick={() => goToTrainOpening(r, opening)}>Train</Button>
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
