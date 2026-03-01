import { VariantMistake } from "@chess-opening-master/common";
import { toUtcDateKey } from "../../utils/dateUtils";

export const isTrainMistakeDue = (
  mistake: VariantMistake,
  now: Date = new Date(),
  todayDayKey: string = toUtcDateKey(now)
): boolean => mistake.dueAt.getTime() <= now.getTime() && mistake.lastReviewedDayKey !== todayDayKey;

export const getDueTrainMistakes = (
  mistakes: VariantMistake[],
  now: Date = new Date()
): VariantMistake[] => {
  const todayDayKey = toUtcDateKey(now);

  return mistakes.filter((mistake) => isTrainMistakeDue(mistake, now, todayDayKey));
};
