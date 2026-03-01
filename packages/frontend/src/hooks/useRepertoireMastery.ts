import { useEffect, useState } from "react";
import { getTrainOverview } from "../repository/train/train";

export const useRepertoireMastery = (repertoireId: string): number | null => {
  const [mastery, setMastery] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const overview = await getTrainOverview();
        if (ignore) return;
        const group = overview.repertoires.find((r) => r.repertoireId === repertoireId);
        if (!group || group.openings.length === 0) {
          setMastery(null);
          return;
        }
        const totalWeighted = group.openings.reduce(
          (sum, o) => sum + o.masteryScore * o.totalVariantsCount,
          0
        );
        const totalVariants = group.openings.reduce(
          (sum, o) => sum + o.totalVariantsCount,
          0
        );
        setMastery(totalVariants > 0 ? Math.round(totalWeighted / totalVariants) : null);
      } catch {
        if (!ignore) setMastery(null);
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [repertoireId]);

  return mastery;
};
