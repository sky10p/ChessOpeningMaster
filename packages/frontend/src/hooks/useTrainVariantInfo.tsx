import { TrainVariantInfo } from "@chess-opening-master/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TrainVariant, Variant } from "../models/chess.models";
import { getTrainVariantInfo } from "../repository/repertoires/trainVariants";
import {
  getColor,
  getTextColor,
} from "../components/design/SelectTrainVariants/utils";

export const useTrainVariantInfo = (
  repertoireId: string) => {
  const [variantsInfo, setVariantsInfo] = useState<TrainVariantInfo[]>([]);

  const groupedVariantsInfo = useMemo(() => {
    const groupedInfo: Record<string, TrainVariantInfo> = {};
    variantsInfo.forEach((info) => {
      groupedInfo[info.variantName] = info;
    });
    return groupedInfo;
  }, [variantsInfo]);

  const getColorFromVariant = useCallback(
    (variant: Variant | TrainVariant) => {
      if ("state" in variant) {
        return getColor(variant, groupedVariantsInfo);
      }
      const trainVariant: TrainVariant = { variant, state: "inProgress" };
      return getColor(trainVariant, groupedVariantsInfo);
    },
    [groupedVariantsInfo]
  );

  const getTextColorFromVariant = useCallback(
    (variant: Variant | TrainVariant) => {
      if ("state" in variant) {
        return getTextColor(variant, groupedVariantsInfo);
      }
      const trainVariant: TrainVariant = { variant, state: "inProgress" };
      return getTextColor(trainVariant, groupedVariantsInfo);
    },
    [groupedVariantsInfo]
  );

  useEffect(() => {
    getTrainVariantInfo(repertoireId).then((info) => {
      setVariantsInfo(info);
    }).catch((error) => {
        console.error(error);
    });
  }, [repertoireId]);

  return {
    variantsInfo,
    groupedVariantsInfo,
    getColorFromVariant,
    getTextColorFromVariant,
  };
};
