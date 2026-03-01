import { MistakeSnapshotItem, ReviewRating } from "../types/Variants";

type VariantMoveLike = {
  variantName?: string;
  position: number;
};

type VariantLike<TMove extends VariantMoveLike = VariantMoveLike> = {
  name: string;
  fullName: string;
  moves: TMove[];
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const getOpeningNameFromVariant = (variantName: string): string => {
  const openingName = variantName.split(":")[0]?.trim();
  return openingName || variantName;
};

export const getVariantStartPly = <TMove extends VariantMoveLike>(
  variant: VariantLike<TMove>
): number => {
  let startPly = 0;
  variant.moves.forEach((moveNode) => {
    if (
      moveNode.variantName &&
      (moveNode.variantName === variant.name ||
        moveNode.variantName === variant.fullName)
    ) {
      startPly = moveNode.position;
    }
  });
  return Math.max(0, startPly);
};

export const mergeMistakeSnapshotItems = (
  existing: MistakeSnapshotItem[],
  incoming: MistakeSnapshotItem[]
): MistakeSnapshotItem[] => {
  const map = new Map<string, MistakeSnapshotItem>();
  existing.forEach((item) => map.set(item.mistakeKey, item));
  incoming.forEach((item) => map.set(item.mistakeKey, item));
  return Array.from(map.values());
};

export const computeNextMastery = (params: {
  previousMastery: number;
  rating: ReviewRating;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
}): number => {
  const ratingBonusMap: Record<ReviewRating, number> = {
    again: -12,
    hard: -4,
    good: 4,
    easy: 10,
  };
  const sessionScore = Math.max(
    0,
    100 -
      22 * Math.max(0, Math.floor(params.wrongMoves)) -
      8 * Math.max(0, Math.floor(params.ignoredWrongMoves)) -
      6 * Math.max(0, Math.floor(params.hintsUsed))
  );
  const perfectRun =
    params.wrongMoves === 0 &&
    params.ignoredWrongMoves === 0 &&
    params.hintsUsed === 0;
  const perfectBonus = perfectRun ? 8 : 0;
  return clamp(
    Math.round(
      0.75 * params.previousMastery +
        0.25 * sessionScore +
        ratingBonusMap[params.rating] +
        perfectBonus
    ),
    0,
    100
  );
};
