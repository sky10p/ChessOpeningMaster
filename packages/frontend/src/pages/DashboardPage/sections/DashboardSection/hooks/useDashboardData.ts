import { useMemo } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { toUtcDateKey, getLastUtcDateKeys } from "../../../../../utils/dateUtils";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import {
  FilterType,
  ProgressStats,
  ReviewDataItem,
  ReviewActivityItem,
  ChartMargins,
} from "../types";
import {
  filterRepertoires,
  getRelevantVariants,
  findVariantInfo,
  generateOpeningStats,
  generateVariantsWithErrorsByOpening,
  getMostRecentRepertoire,
  generateAllOpeningsProgress,
} from "../utils";

export const useDashboardData = (
  repertoires: IRepertoireDashboard[],
  filter: FilterType
) => {
  const isMobile = useIsMobile();
  const yAxisWidth = isMobile ? 90 : 180;
  const barChartMargin: ChartMargins = useMemo(
    () => ({
      top: 20,
      right: 30,
      left: isMobile ? 60 : 120,
      bottom: 20,
    }),
    [isMobile]
  );

  const invalidOrientationReps = useMemo(
    () =>
      repertoires.filter(
        (r) => r.orientation !== "white" && r.orientation !== "black"
      ),
    [repertoires]
  );

  const filteredRepertoires = useMemo(
    () => filterRepertoires(repertoires, filter),
    [repertoires, filter]
  );

  const allVariants = useMemo(
    () => filteredRepertoires.flatMap((rep) => getRelevantVariants(rep, filter)),
    [filteredRepertoires, filter]
  );

  const totalRepertoires = filteredRepertoires.length;
  const totalVariants = allVariants.length;

  const errorsByOpeningTop5 = useMemo(
    () => generateOpeningStats(filteredRepertoires, filter, "errors", 5),
    [filteredRepertoires, filter]
  );

  const variantsWithErrorsByOpeningTop5 = useMemo(
    () => generateVariantsWithErrorsByOpening(filteredRepertoires, filter, 5),
    [filteredRepertoires, filter]
  );

  const masteredOpenings = useMemo(
    () => generateOpeningStats(filteredRepertoires, filter, "mastered", 5),
    [filteredRepertoires, filter]
  );

  const allOpeningsProgress = useMemo(
    () => generateAllOpeningsProgress(filteredRepertoires, filter),
    [filteredRepertoires, filter]
  );

  const mostRecent = useMemo(
    () => getMostRecentRepertoire(filteredRepertoires),
    [filteredRepertoires]
  );

  const variantToRepertoireMap = useMemo(() => {
    const map = new Map<string, IRepertoireDashboard>();
    filteredRepertoires.forEach((rep) => {
      const variants = getRelevantVariants(rep, filter);
      variants.forEach((variant) => {
        map.set(variant.fullName, rep);
      });
    });
    return map;
  }, [filteredRepertoires, filter]);

  const progressStats = useMemo<ProgressStats>(() => {
    const todayKey = toUtcDateKey(new Date());
    let neverReviewed = 0;
    let reviewedWithErrors = 0;
    let reviewedOK = 0;
    let reviewedToday = 0;
    let reviewedTodayErrors = 0;
    let reviewedTodayOk = 0;

    allVariants.forEach((variant) => {
      const rep = variantToRepertoireMap.get(variant.fullName);

      const info = rep ? findVariantInfo(variant, rep) : undefined;

      if (!info || !info.lastDate) {
        neverReviewed++;
        return;
      }

      const lastDateKey = toUtcDateKey(new Date(info.lastDate));

      if (lastDateKey === todayKey) {
        reviewedToday++;
        if (info.errors && info.errors > 0) {
          reviewedTodayErrors++;
        } else {
          reviewedTodayOk++;
        }
      }

      if (info.errors && info.errors > 0) {
        reviewedWithErrors++;
      } else {
        reviewedOK++;
      }
    });

    return {
      neverReviewed,
      reviewedWithErrors,
      reviewedOK,
      reviewedToday,
      reviewedTodayErrors,
      reviewedTodayOk,
    };
  }, [allVariants, variantToRepertoireMap]);

  const reviewData = useMemo<ReviewDataItem[]>(
    () => [
      { name: "Never Reviewed", value: progressStats.neverReviewed },
      { name: "Reviewed With Errors", value: progressStats.reviewedWithErrors },
      { name: "Reviewed OK", value: progressStats.reviewedOK },
    ],
    [progressStats]
  );

  const reviewActivityDataLast10 = useMemo<ReviewActivityItem[]>(() => {
    const reviewActivity: Record<string, number> = {};

    filteredRepertoires.forEach((rep) => {
      const relevantVariants = getRelevantVariants(rep, filter);

      relevantVariants.forEach((variant) => {
        const info = findVariantInfo(variant, rep);
        if (info && info.lastDate) {
          const date = toUtcDateKey(new Date(info.lastDate));
          reviewActivity[date] = (reviewActivity[date] || 0) + 1;
        }
      });
    });

    const last10Days = getLastUtcDateKeys(10);

    return last10Days.map((date) => ({
      date,
      count: reviewActivity[date] || 0,
    }));
  }, [filteredRepertoires, filter]);

  const hasReviewActivity = useMemo(
    () => reviewActivityDataLast10.some((d) => d.count > 0),
    [reviewActivityDataLast10]
  );

  return {
    isMobile,
    yAxisWidth,
    barChartMargin,
    invalidOrientationReps,
    filteredRepertoires,
    totalRepertoires,
    totalVariants,
    errorsByOpeningTop5,
    variantsWithErrorsByOpeningTop5,
    masteredOpenings,
    allOpeningsProgress,
    mostRecent,
    progressStats,
    reviewData,
    reviewActivityDataLast10,
    hasReviewActivity,
  };
};
