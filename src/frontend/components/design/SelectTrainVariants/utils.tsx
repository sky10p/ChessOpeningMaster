import { TrainVariant } from "../../../models/chess.models";
import { TrainVariantInfo } from "./models";

export const VARIANT_COLORS = {
    noErrors: "#008000", // Verde
    oneError: "#FFA07A", // Naranja claro
    twoErrors: "#FFA500", // Naranja
    moreThanTwoErrors: "#FF4500", // Rojo anaranjado
    unresolved: "#FFFFFF", // Blanco
};

export const VARIANT_TEXT_COLORS = {
    noErrors: "#FFFFFF", // Blanco
    oneError: "#000000",
    twoErrors: "#000000",
    moreThanTwoErrors: "#FFFFFF", // Blanco
    unresolved: "#000000",
};

export const getColor = (
  variant: TrainVariant,
  variantInfo: Record<string, TrainVariantInfo>
) => {
  const info = variantInfo[variant.variant.fullName];
  if (info === undefined) {
    return VARIANT_COLORS.unresolved;
  }
  if (info.errors === 0) {
    return VARIANT_COLORS.noErrors;
  }
  if (info.errors === 1) {
    return VARIANT_COLORS.oneError;
  }
  if (info.errors === 2) {
    return VARIANT_COLORS.twoErrors;
  }
  return VARIANT_COLORS.moreThanTwoErrors;
};

export const getTextColor = (
  variant: TrainVariant,
  variantInfo: Record<string, TrainVariantInfo>
) => {
   const color  = getColor(variant, variantInfo);
   if(color === VARIANT_COLORS.unresolved){
        return VARIANT_TEXT_COLORS.unresolved;
   }
};