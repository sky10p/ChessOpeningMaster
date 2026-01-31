import { IRepertoireDashboard } from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../../models/VariantNode";
import {
  FilterType,
  VariantInfo,
  OpeningRatioStats,
  OpeningStats,
  OpeningWithVariants,
  VariantWithErrors,
  OpeningProgressData,
  OpeningWithUnreviewedVariants,
  UnreviewedVariant,
} from "./types";

export const getRatioColor = (ratio: number): string => {
  if (ratio >= 80) return "bg-green-500";
  if (ratio >= 60) return "bg-lime-500";
  if (ratio >= 40) return "bg-yellow-500";
  if (ratio >= 20) return "bg-orange-500";
  return "bg-red-500";
};

export const getRatioTextColor = (ratio: number): string => {
  if (ratio >= 80) return "text-green-400";
  if (ratio >= 60) return "text-lime-400";
  if (ratio >= 40) return "text-yellow-400";
  if (ratio >= 20) return "text-orange-400";
  return "text-red-400";
};

export const getRelevantVariants = (
  rep: IRepertoireDashboard,
  filter: FilterType
) => {
  if (!rep.moveNodes) return [];

  const variants = MoveVariantNode.initMoveVariantNode(
    rep.moveNodes
  ).getVariants();

  if (filter === "unreviewed") {
    return variants.filter((variant) => {
      const info = findVariantInfo(variant, rep);
      return !info || !info.lastDate;
    });
  }

  return variants;
};

export const findVariantInfo = (
  variant: { fullName: string },
  rep: IRepertoireDashboard
): VariantInfo | undefined => {
  return (rep.variantsInfo || []).find(
    (i) => i.variantName === variant.fullName
  );
};

export const filterRepertoires = (
  repertoires: IRepertoireDashboard[],
  filter: FilterType
): IRepertoireDashboard[] => {
  if (filter === "white") {
    return repertoires.filter((r) => r.orientation === "white");
  }
  if (filter === "black") {
    return repertoires.filter((r) => r.orientation === "black");
  }
  if (filter === "errors") {
    return repertoires.filter((r) =>
      (r.variantsInfo || []).some((info) => (info.errors || 0) > 0)
    );
  }
  if (filter === "unreviewed") {
    return repertoires.filter((r) => {
      if (!r.moveNodes) return false;
      const variants = getRelevantVariants(r, filter);
      return variants.length > 0;
    });
  }
  return repertoires;
};

export const generateOpeningStats = (
  filteredRepertoires: IRepertoireDashboard[],
  filter: FilterType,
  statType: "errors" | "mastered",
  topCount = 5
): OpeningStats[] => {
  const statsMap: Record<string, number> = {};

  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, filter);

    relevantVariants.forEach((variant) => {
      const info = findVariantInfo(variant, rep);
      if (statType === "errors") {
        if (info && (info.errors ?? 0) > 0) {
          statsMap[variant.name] =
            (statsMap[variant.name] || 0) + (info.errors ?? 0);
        }
      } else if (statType === "mastered") {
        if (info && info.lastDate && (info.errors ?? 0) === 0) {
          statsMap[variant.name] = (statsMap[variant.name] || 0) + 1;
        }
      }
    });
  });

  return Object.entries(statsMap)
    .map(([opening, count]) => ({ opening, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topCount);
};

export const generateVariantsWithErrorsByOpening = (
  filteredRepertoires: IRepertoireDashboard[],
  filter: FilterType,
  topCount?: number
): OpeningWithVariants[] => {
  const variantsWithErrorsMap: Record<string, Map<string, VariantWithErrors>> = {};

  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, filter);

    relevantVariants.forEach((variant) => {
      const info = findVariantInfo(variant, rep);
      if (info && (info.errors ?? 0) > 0) {
        if (!variantsWithErrorsMap[variant.name]) {
          variantsWithErrorsMap[variant.name] = new Map();
        }
        const key = `${rep._id}::${variant.fullName}`;
        variantsWithErrorsMap[variant.name].set(key, {
          fullName: variant.fullName,
          errors: info.errors ?? 0,
          repertoireId: rep._id,
          repertoireName: rep.name,
        });
      }
    });
  });

  const allOpenings = Object.entries(variantsWithErrorsMap)
    .map(([opening, variantsMap]) => ({
      opening,
      count: variantsMap.size,
      variants: Array.from(variantsMap.values()).sort((a, b) => b.errors - a.errors),
    }))
    .sort((a, b) => {
      const totalErrorsA = a.variants.reduce((sum, v) => sum + v.errors, 0);
      const totalErrorsB = b.variants.reduce((sum, v) => sum + v.errors, 0);
      return totalErrorsB - totalErrorsA;
    });

  return typeof topCount === "number" ? allOpenings.slice(0, topCount) : allOpenings;
};

export const generateOpeningRatioStats = (
  filteredRepertoires: IRepertoireDashboard[],
  filter: FilterType,
  sortBy: "worst" | "best",
  topCount = 5
): OpeningRatioStats[] => {
  const openingStats: Record<string, { total: number; problems: number }> = {};

  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, filter);

    relevantVariants.forEach((variant) => {
      if (!openingStats[variant.name]) {
        openingStats[variant.name] = { total: 0, problems: 0 };
      }
      openingStats[variant.name].total++;

      const info = findVariantInfo(variant, rep);
      const hasErrors = info && (info.errors ?? 0) > 0;
      const neverReviewed = !info || !info.lastDate;

      if (hasErrors || neverReviewed) {
        openingStats[variant.name].problems++;
      }
    });
  });

  return Object.entries(openingStats)
    .filter(([, stats]) => stats.total > 0)
    .map(([opening, stats]) => ({
      opening,
      ratio: Math.round((stats.problems / stats.total) * 100),
      totalVariants: stats.total,
      problemVariants: stats.problems,
    }))
    .sort((a, b) => {
      if (sortBy === "worst") {
        return b.ratio - a.ratio || b.problemVariants - a.problemVariants;
      }
      return a.ratio - b.ratio || b.totalVariants - a.totalVariants;
    })
    .slice(0, topCount);
};

export const getMostRecentRepertoire = (
  filteredRepertoires: IRepertoireDashboard[]
): { name: string; date: Date } | null => {
  return filteredRepertoires.reduce((latest, rep) => {
    if (!rep.variantsInfo || rep.variantsInfo.length === 0) return latest;

    const maxDate = rep.variantsInfo.reduce((max, info) => {
      if (!info.lastDate) return max;
      const date = new Date(info.lastDate);
      return !max || date > max ? date : max;
    }, null as Date | null);

    if (!maxDate) return latest;
    if (!latest || maxDate > latest.date) {
      return { name: rep.name, date: maxDate };
    }
    return latest;
  }, null as null | { name: string; date: Date });
};

export const generateAllOpeningsProgress = (
  filteredRepertoires: IRepertoireDashboard[],
  filter: FilterType
): OpeningProgressData[] => {
  const openingStats: Record<string, { total: number; mastered: number; withProblems: number }> = {};

  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, filter);

    relevantVariants.forEach((variant) => {
      if (!openingStats[variant.name]) {
        openingStats[variant.name] = { total: 0, mastered: 0, withProblems: 0 };
      }
      openingStats[variant.name].total++;

      const info = findVariantInfo(variant, rep);
      const hasErrors = info && (info.errors ?? 0) > 0;
      const neverReviewed = !info || !info.lastDate;

      if (hasErrors || neverReviewed) {
        openingStats[variant.name].withProblems++;
      } else {
        openingStats[variant.name].mastered++;
      }
    });
  });

  return Object.entries(openingStats)
    .filter(([, stats]) => stats.total > 0)
    .map(([opening, stats]) => ({
      opening,
      totalVariants: stats.total,
      mastered: stats.mastered,
      withProblems: stats.withProblems,
      ratio: Math.round((stats.mastered / stats.total) * 100),
    }));
};

export const generateUnreviewedVariantsByOpening = (
  filteredRepertoires: IRepertoireDashboard[],
  topCount?: number
): OpeningWithUnreviewedVariants[] => {
  const unreviewedMap: Record<string, Map<string, UnreviewedVariant>> = {};

  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, "unreviewed");

    relevantVariants.forEach((variant) => {
      if (!unreviewedMap[variant.name]) {
        unreviewedMap[variant.name] = new Map();
      }
      const key = `${rep._id}::${variant.fullName}`;
      unreviewedMap[variant.name].set(key, {
        fullName: variant.fullName,
        repertoireId: rep._id,
        repertoireName: rep.name,
      });
    });
  });

  const allOpenings = Object.entries(unreviewedMap)
    .map(([opening, variantsMap]) => ({
      opening,
      count: variantsMap.size,
      variants: Array.from(variantsMap.values()),
    }))
    .sort((a, b) => b.count - a.count);

  return typeof topCount === "number" ? allOpenings.slice(0, topCount) : allOpenings;
};
