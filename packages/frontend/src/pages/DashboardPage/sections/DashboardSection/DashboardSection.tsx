import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ExpandableVariantsChart } from "../../components/ExpandableVariantsChart";
import { useNavigationUtils } from "../../../../utils/navigationUtils";
import { DashboardSectionProps, FilterType } from "./types";
import { getRelevantVariants } from "./utils";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  FilterButtons,
  StatsCards,
  VerticalBarChart,
  VariantsReviewStatusChart,
  ReviewActivityChart,
  ProgressSummary,
  InvalidOrientationWarning,
  OpeningsProgressCard,
} from "./components";

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  repertoires,
  loading = false,
}) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const navigate = useNavigate();
  const location = useLocation();
  const { goToTrainRepertoire, goToTrainRepertoireWithVariants } = useNavigationUtils();

  const {
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
  } = useDashboardData(repertoires, filter);

  const handleOpeningClick = (openingName: string) => {
    const repertoireWithOpening = filteredRepertoires.find((rep) => {
      const variants = getRelevantVariants(rep, filter);
      return variants.some((v) => v.name === openingName);
    });

    if (repertoireWithOpening) {
      goToTrainRepertoire(repertoireWithOpening._id, openingName);
    }
  };

  const handleVariantClick = (variantFullName: string) => {
    const repertoireWithVariant = filteredRepertoires.find((rep) => {
      const variants = getRelevantVariants(rep, filter);
      return variants.some((v) => v.fullName === variantFullName);
    });

    if (repertoireWithVariant) {
      goToTrainRepertoire(repertoireWithVariant._id, variantFullName);
    }
  };

  const handleVariantsClick = (repertoireId: string, variantFullNames: string[]) => {
    goToTrainRepertoireWithVariants(repertoireId, variantFullNames);
  };

  const handleViewAllOpenings = () => {
    const params = new URLSearchParams(location.search);
    params.set("section", "overview");
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  if (loading) {
    return (
      <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="h-7 w-56 rounded-lg bg-surface-raised animate-pulse mb-2" />
          <div className="h-4 w-80 rounded bg-surface-raised animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-default bg-surface-raised animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-default bg-surface-raised animate-pulse h-56" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <header className="mb-4">
        <h2 className="font-bold text-text-base text-2xl leading-tight mb-1 truncate">
          Dashboard Overview
        </h2>
        <p className="text-text-muted text-base leading-snug mb-2 truncate">
          Key statistics and metrics for your chess repertoires.
        </p>
        <FilterButtons filter={filter} onFilterChange={setFilter} />
        <InvalidOrientationWarning repertoires={invalidOrientationReps} />
      </header>

      <div className="flex-1">
        <StatsCards
          totalRepertoires={totalRepertoires}
          totalVariants={totalVariants}
          mostRecentName={mostRecent?.name ?? null}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-x-auto">
          <VariantsReviewStatusChart data={reviewData} />

          <VerticalBarChart
            data={errorsByOpeningTop5}
            title="Errors by Opening"
            label="Errors"
            barName="Errors"
            barColor="#ef4444"
            tooltipValueLabel="errors"
            emptyMessage="No errors found"
            isMobile={isMobile}
            yAxisWidth={yAxisWidth}
            barChartMargin={barChartMargin}
            onOpeningClick={handleOpeningClick}
          />

          <OpeningsProgressCard
            data={allOpeningsProgress}
            type="needWork"
            onOpeningClick={handleOpeningClick}
            onViewAllClick={handleViewAllOpenings}
          />

          <OpeningsProgressCard
            data={allOpeningsProgress}
            type="wellLearned"
            onOpeningClick={handleOpeningClick}
            onViewAllClick={handleViewAllOpenings}
          />

          <ExpandableVariantsChart
            data={variantsWithErrorsByOpeningTop5}
            title="Variants with Errors by Opening"
            emptyMessage="No variants with errors found"
            isMobile={isMobile}
            onVariantClick={handleVariantClick}
            onVariantsClick={handleVariantsClick}
          />

          <ReviewActivityChart
            data={reviewActivityDataLast10}
            hasActivity={hasReviewActivity}
          />

          <ProgressSummary stats={progressStats} />

          <VerticalBarChart
            data={masteredOpenings}
            title="Top 5 Mastered Openings"
            label="Mastered Lines"
            barName="Mastered Lines"
            barColor="#22c55e"
            tooltipValueLabel="lines"
            emptyMessage="No mastered openings found"
            isMobile={isMobile}
            yAxisWidth={yAxisWidth}
            barChartMargin={barChartMargin}
          />
        </div>
      </div>
    </section>
  );
};
