import React, { useState, useMemo } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { MoveVariantNode } from "../../../models/VariantNode";
import { FilterType } from "./DashboardSection/types";
import {
  findVariantInfo,
  generateOpeningStats,
  generateVariantsWithErrorsByOpening,
  generateOpeningRatioStats,
  getRelevantVariants,
} from "./DashboardSection/utils";
import { VerticalBarChart, RatioBarChart } from "../components/DashboardCharts";
import { ExpandableVariantsChart } from "../components/ExpandableVariantsChart";
import { useNavigationUtils } from "../../../utils/navigationUtils";
import { getLastUtcDateKeys, toUtcDateKey } from "../../../utils/dateUtils";

interface DashboardSectionProps {
  repertoires: IRepertoireDashboard[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  repertoires,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const yAxisWidth = isMobile ? 90 : 180;
  const barChartMargin = useMemo(() => ({ 
    top: 20, 
    right: 30, 
    left: isMobile ? 60 : 120, 
    bottom: 20 
  }), [isMobile]);
  const { goToTrainRepertoire, goToTrainRepertoireWithVariants } = useNavigationUtils();

  const [filter, setFilter] = useState<FilterType>("all");

  const invalidOrientationReps = repertoires.filter(
    (r) => r.orientation !== "white" && r.orientation !== "black"
  );

  let filteredRepertoires = repertoires;
  if (filter === "white") {
    filteredRepertoires = repertoires.filter((r) => r.orientation === "white");
  } else if (filter === "black") {
    filteredRepertoires = repertoires.filter((r) => r.orientation === "black");
  } else if (filter === "errors") {
    filteredRepertoires = repertoires.filter((r) =>
      (r.variantsInfo || []).some((info) => (info.errors || 0) > 0)
    );
  } else if (filter === "unreviewed") {
    filteredRepertoires = repertoires.filter((r) => {
      if (!r.moveNodes) return false;
      const variants = getRelevantVariants(r, filter);
      return variants.length > 0;
    });
  }

  const totalRepertoires = filteredRepertoires.length;

  const allVariants = filteredRepertoires.flatMap((rep) => 
    getRelevantVariants(rep, filter)
  );
  const totalVariants = allVariants.length;


  const errorsByOpeningTop5 = generateOpeningStats(filteredRepertoires, filter, "errors", 5);
  const variantsWithErrorsByOpeningTop5 = generateVariantsWithErrorsByOpening(filteredRepertoires, filter, 5);
  const masteredOpenings = generateOpeningStats(filteredRepertoires, filter, "mastered", 5);
  const worstRatioOpenings = generateOpeningRatioStats(filteredRepertoires, filter, "worst", 5);
  const bestRatioOpenings = generateOpeningRatioStats(filteredRepertoires, filter, "best", 5);

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


  const mostRecent = filteredRepertoires.reduce((latest, rep) => {
    const lastDate =
      rep.variantsInfo && rep.variantsInfo[0]?.lastDate
        ? new Date(rep.variantsInfo[0].lastDate)
        : null;
    if (!lastDate) return latest;
    if (!latest || lastDate > latest.date) {
      return { name: rep.name, date: lastDate };
    }
    return latest;
  }, null as null | { name: string; date: Date });


  const todayKey = toUtcDateKey(new Date());

  let neverReviewed = 0;
  let reviewedWithErrors = 0;
  let reviewedOK = 0;
  let reviewedToday = 0;
  let reviewedTodayErrors = 0;
  let reviewedTodayOk = 0;
  
  allVariants.forEach((variant) => {
    const rep = filteredRepertoires.find(
      (r) =>
        r.moveNodes &&
        MoveVariantNode.initMoveVariantNode(r.moveNodes)
          .getVariants()
          .some((v) => v.fullName === variant.fullName)
    );
    
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
  
  const reviewData = [
    { name: "Never Reviewed", value: neverReviewed },
    { name: "Reviewed With Errors", value: reviewedWithErrors },
    { name: "Reviewed OK", value: reviewedOK },
  ];


  const errorsDistribution: Record<number, number> = {};
  const reviewActivity: Record<string, number> = {};
  
  filteredRepertoires.forEach((rep) => {
    const relevantVariants = getRelevantVariants(rep, filter);
    
    relevantVariants.forEach((variant) => {
      const info = findVariantInfo(variant, rep);
      const err = info?.errors || 0;
      
      errorsDistribution[err] = (errorsDistribution[err] || 0) + 1;
      
      if (info && info.lastDate) {
        const date = toUtcDateKey(new Date(info.lastDate));
        reviewActivity[date] = (reviewActivity[date] || 0) + 1;
      }
    });
  });
  
  const reviewActivityData = Object.entries(reviewActivity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));


  const last10Days = getLastUtcDateKeys(10);
  
  const reviewActivityDataLast10 = last10Days.map((date) => {
    const entry = reviewActivityData.find((d) => d.date === date);
    return { date, count: entry ? entry.count : 0 };
  });
  
  const hasReviewActivity = reviewActivityDataLast10.some((d) => d.count > 0);

  const COLORS = ["#f59e42", "#ef4444", "#22c55e"];

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4">
      <header className="mb-4">
        <h2 className="font-bold text-gray-100 text-2xl leading-tight mb-1 truncate">
          Dashboard Overview
        </h2>
        <p className="text-gray-300 text-base leading-snug mb-2 truncate">
          Key statistics and metrics for your chess repertoires.
        </p>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("white")}
            className={`px-3 py-1 rounded ${
              filter === "white"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            Only White
          </button>
          <button
            onClick={() => setFilter("black")}
            className={`px-3 py-1 rounded ${
              filter === "black"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            Only Black
          </button>
          <button
            onClick={() => setFilter("errors")}
            className={`px-3 py-1 rounded ${
              filter === "errors"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            Only Errors
          </button>
          <button
            onClick={() => setFilter("unreviewed")}
            className={`px-3 py-1 rounded ${
              filter === "unreviewed"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            Only Unreviewed
          </button>
        </div>
        {invalidOrientationReps.length > 0 && (
          <div className="text-yellow-400 text-xs mb-2">
            Warning: {invalidOrientationReps.length} repertoire(s) have missing
            or invalid orientation and will only appear in "All".
            <br />
            <span className="block mt-1">Debug list:</span>
            <ul className="list-disc ml-4">
              {invalidOrientationReps.map((r) => (
                <li key={r._id}>
                  {r.name} (orientation: {String(r.orientation)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <div style={{ maxHeight: "600px", overflowY: "auto" }} className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-400">
              {totalRepertoires}
            </span>
            <span className="text-gray-300 mt-1">Total Repertoires</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <span className="text-3xl font-bold text-amber-400">
              {totalVariants}
            </span>
            <span className="text-gray-300 mt-1">Total Variants</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <span className="text-3xl font-bold text-purple-400">
              {mostRecent ? mostRecent.name : "-"}
            </span>
            <span className="text-gray-300 mt-1">Most Recently Updated</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-x-auto">
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Variants Review Status
            </h3>
            {reviewData.every((d) => d.value === 0) ? (
              <div className="text-gray-400 text-center py-8">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={reviewData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {reviewData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
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
          
          <RatioBarChart
            data={worstRatioOpenings}
            type="worst"
            isMobile={isMobile}
            yAxisWidth={yAxisWidth}
            barChartMargin={barChartMargin}
            onOpeningClick={handleOpeningClick}
          />
          
          <RatioBarChart
            data={bestRatioOpenings}
            type="best"
            isMobile={isMobile}
            yAxisWidth={yAxisWidth}
            barChartMargin={barChartMargin}
            onOpeningClick={handleOpeningClick}
          />
          
          <ExpandableVariantsChart
            data={variantsWithErrorsByOpeningTop5}
            title="Variants with Errors by Opening"
            emptyMessage="No variants with errors found"
            isMobile={isMobile}
            onVariantClick={handleVariantClick}
            onVariantsClick={handleVariantsClick}
          />
          
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Review Activity Over Time (10 days)
            </h3>
            {!hasReviewActivity ? (
              <div className="text-gray-400 text-center py-8">
                No review activity in the last 10 days
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={reviewActivityDataLast10}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Reviewed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">
              Progress Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-amber-400">
                  {neverReviewed}
                </span>
                <span className="text-gray-300 mt-1 text-sm text-center">
                  Overall Unreviewed
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-red-400">
                  {reviewedWithErrors}
                </span>
                <span className="text-gray-300 mt-1 text-sm">Overall Errors</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {reviewedToday}
                </span>
                <span className="text-gray-300 mt-1 text-sm">Reviewed Today</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-red-400">
                  {reviewedTodayErrors}
                </span>
                <span className="text-gray-300 mt-1 text-sm">Errors Today</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-400">
                  {reviewedTodayOk}
                </span>
                <span className="text-gray-300 mt-1 text-sm">OK Today</span>
              </div>
            </div>
          </div>
          
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
