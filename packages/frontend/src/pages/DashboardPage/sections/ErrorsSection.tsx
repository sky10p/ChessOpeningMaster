import React, { useMemo, useState } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { generateVariantsWithErrorsByOpening } from "../components/DashboardCharts";
import { ExpandableVariantsChart, OpeningWithVariants } from "../components/ExpandableVariantsChart";
import { RepertoireFilterDropdown } from "../components/RepertoireFilterDropdown";
import { useNavigationUtils } from "../../../utils/navigationUtils";
import { getRelevantVariants } from "../components/DashboardCharts";

interface ErrorsSectionProps {
  repertoires: IRepertoireDashboard[];
}

type SortOption = "errors" | "variants" | "name";

type OrientationFilter = "all" | "white" | "black";

export const ErrorsSection: React.FC<ErrorsSectionProps> = ({ repertoires }) => {
  const { goToTrainRepertoire, goToTrainRepertoireWithVariants } = useNavigationUtils();
  const [orientationFilter, setOrientationFilter] = useState<OrientationFilter>("all");
  const [selectedRepertoires, setSelectedRepertoires] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [minErrors, setMinErrors] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOption>("errors");

  const filteredRepertoires = useMemo(() => {
    if (orientationFilter === "all") return repertoires;
    return repertoires.filter((r) => r.orientation === orientationFilter);
  }, [orientationFilter, repertoires]);

  const allOpeningsData = useMemo(() => {
    return generateVariantsWithErrorsByOpening(filteredRepertoires, "all");
  }, [filteredRepertoires]);

  const filteredOpenings = useMemo<OpeningWithVariants[]>(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const byRepertoire = allOpeningsData
      .map((opening) => {
        const variants = opening.variants.filter((v) =>
          selectedRepertoires.length === 0 ? true : selectedRepertoires.includes(v.repertoireId)
        );
        return {
          ...opening,
          variants,
          count: variants.length,
        };
      })
      .filter((opening) => opening.variants.length > 0);

    const bySearch = normalizedSearch.length === 0
      ? byRepertoire
      : byRepertoire.filter((opening) => opening.opening.toLowerCase().includes(normalizedSearch));

    const withMinErrors = bySearch.filter((opening) => {
      const totalErrors = opening.variants.reduce((sum, v) => sum + v.errors, 0);
      return totalErrors >= minErrors;
    });

    const sorted = [...withMinErrors].sort((a, b) => {
      if (sortBy === "name") {
        return a.opening.localeCompare(b.opening);
      }
      if (sortBy === "variants") {
        return b.count - a.count;
      }
      const totalErrorsA = a.variants.reduce((sum, v) => sum + v.errors, 0);
      const totalErrorsB = b.variants.reduce((sum, v) => sum + v.errors, 0);
      return totalErrorsB - totalErrorsA;
    });

    return sorted;
  }, [allOpeningsData, minErrors, searchTerm, selectedRepertoires, sortBy]);

  const summary = useMemo(() => {
    const totalErrors = filteredOpenings.reduce(
      (sum, opening) => sum + opening.variants.reduce((acc, v) => acc + v.errors, 0),
      0
    );
    const totalErrorVariants = filteredOpenings.reduce(
      (sum, opening) => sum + opening.variants.length,
      0
    );
    return {
      totalErrors,
      totalErrorVariants,
      totalOpenings: filteredOpenings.length,
    };
  }, [filteredOpenings]);

  const handleVariantClick = (variantFullName: string) => {
    const repertoireWithVariant = filteredRepertoires.find((rep) => {
      const variants = getRelevantVariants(rep, "all");
      return variants.some((v) => v.fullName === variantFullName);
    });

    if (repertoireWithVariant) {
      goToTrainRepertoire(repertoireWithVariant._id, variantFullName);
    }
  };

  const handleVariantsClick = (repertoireId: string, variantFullNames: string[]) => {
    goToTrainRepertoireWithVariants(repertoireId, variantFullNames);
  };

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4">
      <header className="mb-4">
        <h2 className="font-bold text-gray-100 text-2xl leading-tight mb-1 truncate">
          Errors Management
        </h2>
        <p className="text-gray-300 text-base leading-snug mb-2">
          Focus on openings with errors. Filter by color, repertoire, or search to target your training.
        </p>
      </header>

      <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "white", "black"] as OrientationFilter[]).map((option) => (
              <button
                key={option}
                onClick={() => setOrientationFilter(option)}
                className={`px-3 py-1 rounded text-sm ${
                  orientationFilter === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
              >
                {option === "all" ? "All" : option === "white" ? "White" : "Black"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Repertoires</label>
              <RepertoireFilterDropdown
                filteredRepertoires={filteredRepertoires}
                orientationFilter={orientationFilter}
                selectedRepertoires={selectedRepertoires}
                setSelectedRepertoires={setSelectedRepertoires}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Search opening</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Sicilian"
                className="w-full bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min errors</label>
              <input
                type="number"
                min={0}
                value={minErrors}
                onChange={(e) => setMinErrors(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg text-sm"
              >
                <option value="errors">Total errors</option>
                <option value="variants">Error variants</option>
                <option value="name">Opening name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-red-400">
            {summary.totalErrors}
          </span>
          <span className="text-gray-300 mt-1">Total Errors</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-amber-400">
            {summary.totalErrorVariants}
          </span>
          <span className="text-gray-300 mt-1">Variants With Errors</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-400">
            {summary.totalOpenings}
          </span>
          <span className="text-gray-300 mt-1">Openings With Errors</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <ExpandableVariantsChart
          data={filteredOpenings}
          title="Errors by Opening"
          emptyMessage="No openings found with the selected filters"
          isMobile={typeof window !== "undefined" && window.innerWidth < 768}
          onVariantClick={handleVariantClick}
          onVariantsClick={handleVariantsClick}
        />
      </div>
    </section>
  );
};
