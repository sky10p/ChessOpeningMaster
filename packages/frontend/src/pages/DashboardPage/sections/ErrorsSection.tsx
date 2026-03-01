import React, { useMemo, useState } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { generateVariantsWithErrorsByOpening, getRelevantVariants } from "./DashboardSection/utils";
import { OpeningWithVariants } from "./DashboardSection/types";
import { ExpandableVariantsChart } from "../components/ExpandableVariantsChart";
import { RepertoireFilterDropdown } from "../components/RepertoireFilterDropdown";
import { useNavigationUtils } from "../../../utils/navigationUtils";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { Button, Input, Select } from "../../../components/ui";

interface ErrorsSectionProps {
  repertoires: IRepertoireDashboard[];
}

type SortOption = "errors" | "variants" | "name";

type OrientationFilter = "all" | "white" | "black";

export const ErrorsSection: React.FC<ErrorsSectionProps> = ({ repertoires }) => {
  const { goToTrainRepertoire, goToTrainRepertoireWithVariants } = useNavigationUtils();
  const isMobile = useIsMobile();
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
    <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <header className="mb-4">
        <h2 className="font-bold text-text-base text-2xl leading-tight mb-1 truncate">
          Errors Management
        </h2>
        <p className="text-text-muted text-base leading-snug mb-2">
          Focus on openings with errors. Filter by color, repertoire, or search to target your training.
        </p>
      </header>

      <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "white", "black"] as OrientationFilter[]).map((option) => (
              <Button
                key={option}
                intent={orientationFilter === option ? "primary" : "secondary"}
                size="xs"
                onClick={() => setOrientationFilter(option)}
              >
                {option === "all" ? "All" : option === "white" ? "White" : "Black"}
              </Button>
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
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Sicilian"
              />
            </div>
            <div>
              <label className="block text-xs text-text-subtle mb-1">Min errors</label>
              <Input
                type="number"
                min={0}
                value={minErrors}
                onChange={(e) => setMinErrors(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div>
              <label className="block text-xs text-text-subtle mb-1">Sort by</label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="errors">Total errors</option>
                <option value="variants">Error variants</option>
                <option value="name">Opening name</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
          <span className="text-3xl font-bold text-danger">
            {summary.totalErrors}
          </span>
          <span className="text-text-muted mt-1">Total Errors</span>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
          <span className="text-3xl font-bold text-warning">
            {summary.totalErrorVariants}
          </span>
          <span className="text-text-muted mt-1">Variants With Errors</span>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
          <span className="text-3xl font-bold text-brand">
            {summary.totalOpenings}
          </span>
          <span className="text-text-muted mt-1">Openings With Errors</span>
        </div>
      </div>

      <div className="flex-none sm:flex-1 sm:min-h-0 overflow-visible sm:overflow-y-auto">
        <ExpandableVariantsChart
          data={filteredOpenings}
          title="Errors by Opening"
          emptyMessage="No openings found with the selected filters"
          isMobile={isMobile}
          onVariantClick={handleVariantClick}
          onVariantsClick={handleVariantsClick}
        />
      </div>
    </section>
  );
};
