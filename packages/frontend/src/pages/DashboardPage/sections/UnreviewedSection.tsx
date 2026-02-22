import React, { useMemo, useState } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { generateUnreviewedVariantsByOpening, getRelevantVariants } from "./DashboardSection/utils";
import { OpeningWithUnreviewedVariants } from "./DashboardSection/types";
import { UnreviewedVariantsChart } from "../components/UnreviewedVariantsChart";
import { RepertoireFilterDropdown } from "../components/RepertoireFilterDropdown";
import { useNavigationUtils } from "../../../utils/navigationUtils";

interface UnreviewedSectionProps {
  repertoires: IRepertoireDashboard[];
}

type SortOption = "unreviewed" | "name";

type OrientationFilter = "all" | "white" | "black";

export const UnreviewedSection: React.FC<UnreviewedSectionProps> = ({ repertoires }) => {
  const { goToTrainRepertoire, goToTrainRepertoireWithVariants } = useNavigationUtils();
  const [orientationFilter, setOrientationFilter] = useState<OrientationFilter>("all");
  const [selectedRepertoires, setSelectedRepertoires] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [minUnreviewed, setMinUnreviewed] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOption>("unreviewed");

  const filteredRepertoires = useMemo(() => {
    if (orientationFilter === "all") return repertoires;
    return repertoires.filter((r) => r.orientation === orientationFilter);
  }, [orientationFilter, repertoires]);

  const allOpeningsData = useMemo(() => {
    return generateUnreviewedVariantsByOpening(filteredRepertoires);
  }, [filteredRepertoires]);

  const filteredOpenings = useMemo<OpeningWithUnreviewedVariants[]>(() => {
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

    const withMinCount = bySearch.filter((opening) => opening.count >= minUnreviewed);

    const sorted = [...withMinCount].sort((a, b) => {
      if (sortBy === "name") {
        return a.opening.localeCompare(b.opening);
      }
      return b.count - a.count;
    });

    return sorted;
  }, [allOpeningsData, minUnreviewed, searchTerm, selectedRepertoires, sortBy]);

  const summary = useMemo(() => {
    const totalUnreviewed = filteredOpenings.reduce(
      (sum, opening) => sum + opening.variants.length,
      0
    );
    return {
      totalUnreviewed,
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
    <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <header className="mb-4">
        <h2 className="font-bold text-text-base text-2xl leading-tight mb-1 truncate">
          Unreviewed Variants
        </h2>
        <p className="text-text-muted text-base leading-snug mb-2">
          Focus on variants you haven't reviewed yet. Filter by color, repertoire, or search to plan your study.
        </p>
      </header>

      <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "white", "black"] as OrientationFilter[]).map((option) => (
              <button
                key={option}
                onClick={() => setOrientationFilter(option)}
                className={`px-3 py-1 rounded text-sm ${
                  orientationFilter === option
                    ? "bg-blue-600 text-white"
                    : "bg-surface-raised text-text-muted hover:bg-interactive"
                }`}
              >
                {option === "all" ? "All" : option === "white" ? "White" : "Black"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-text-subtle mb-1">Repertoires</label>
              <RepertoireFilterDropdown
                filteredRepertoires={filteredRepertoires}
                orientationFilter={orientationFilter}
                selectedRepertoires={selectedRepertoires}
                setSelectedRepertoires={setSelectedRepertoires}
              />
            </div>
            <div>
              <label className="block text-xs text-text-subtle mb-1">Search opening</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. French"
                className="w-full bg-surface-raised text-text-base px-3 py-2 border border-border-default rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-subtle mb-1">Min unreviewed</label>
              <input
                type="number"
                min={0}
                value={minUnreviewed}
                onChange={(e) => setMinUnreviewed(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-surface-raised text-text-base px-3 py-2 border border-border-default rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-subtle mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-surface-raised text-text-base px-3 py-2 border border-border-default rounded-lg text-sm"
              >
                <option value="unreviewed">Unreviewed count</option>
                <option value="name">Opening name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
          <span className="text-3xl font-bold text-amber-400">
            {summary.totalUnreviewed}
          </span>
          <span className="text-text-muted mt-1">Unreviewed Variants</span>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-400">
            {summary.totalOpenings}
          </span>
          <span className="text-text-muted mt-1">Openings With Unreviewed</span>
        </div>
      </div>

      <div className="flex-none sm:flex-1 sm:min-h-0 overflow-visible sm:overflow-y-auto">
        <UnreviewedVariantsChart
          data={filteredOpenings}
          title="Unreviewed Variants by Opening"
          emptyMessage="No unreviewed variants found with the selected filters"
          isMobile={typeof window !== "undefined" && window.innerWidth < 768}
          onVariantClick={handleVariantClick}
          onVariantsClick={handleVariantsClick}
        />
      </div>
    </section>
  );
};
