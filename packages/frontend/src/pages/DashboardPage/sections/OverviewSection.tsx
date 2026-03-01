import React, { useState, useMemo } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { useNavigationUtils } from "../../../utils/navigationUtils";
import { OrientationFilter, OpeningWithVariants, OpeningWithUnreviewedVariants } from "./DashboardSection/types";
import {
  getRatioColor,
  getRatioTextColor,
  generateAllOpeningsProgress,
  generateVariantsWithErrorsByOpening,
  generateUnreviewedVariantsByOpening,
  getRelevantVariants,
} from "./DashboardSection/utils";
import { buildDashboardOpeningIndex } from "../utils/openingIndex";
import { ExpandableVariantsChart } from "../components/ExpandableVariantsChart";
import { UnreviewedVariantsChart } from "../components/UnreviewedVariantsChart";
import { RepertoireFilterDropdown } from "../components/RepertoireFilterDropdown";
import { Button, Input, Select, Tabs, TabButton } from "../../../components/ui";

type OverviewView = "progress" | "errors" | "unreviewed";

type SortField = "opening" | "totalVariants" | "mastered" | "withProblems" | "ratio";
type SortDirection = "asc" | "desc";
type ErrorSortOption = "errors" | "variants" | "name";
type UnreviewedSortOption = "unreviewed" | "name";

interface OverviewSectionProps {
  repertoires: IRepertoireDashboard[];
  initialView?: OverviewView;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  repertoires,
  initialView = "progress",
}) => {
  const { goToTrainRepertoire, goToTrainRepertoireWithVariants } = useNavigationUtils();

  const [view, setView] = useState<OverviewView>(initialView);
  const [filter, setFilter] = useState<OrientationFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepertoires, setSelectedRepertoires] = useState<string[]>([]);

  const [sortField, setSortField] = useState<SortField>("ratio");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [minVariants, setMinVariants] = useState<number>(1);

  const [minErrors, setMinErrors] = useState<number>(1);
  const [errorSortBy, setErrorSortBy] = useState<ErrorSortOption>("errors");

  const [minUnreviewed, setMinUnreviewed] = useState<number>(1);
  const [unreviewedSortBy, setUnreviewedSortBy] = useState<UnreviewedSortOption>("unreviewed");

  const filteredRepertoires = useMemo(() => {
    if (filter === "white") return repertoires.filter((r) => r.orientation === "white");
    if (filter === "black") return repertoires.filter((r) => r.orientation === "black");
    return repertoires;
  }, [repertoires, filter]);

  const openingIndex = useMemo(
    () => buildDashboardOpeningIndex(filteredRepertoires),
    [filteredRepertoires]
  );

  const allProgressData = useMemo(
    () => generateAllOpeningsProgress(filteredRepertoires, "all"),
    [filteredRepertoires]
  );

  const filteredAndSortedProgress = useMemo(() => {
    return allProgressData
      .filter((item) => item.totalVariants >= minVariants)
      .filter((item) => item.opening.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
  }, [allProgressData, sortField, sortDirection, minVariants, searchTerm]);

  const errorsData = useMemo(
    () => generateVariantsWithErrorsByOpening(filteredRepertoires, "all"),
    [filteredRepertoires]
  );

  const filteredErrors = useMemo<OpeningWithVariants[]>(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return errorsData
      .map((opening) => {
        const variants = opening.variants.filter((v) =>
          selectedRepertoires.length === 0 ? true : selectedRepertoires.includes(v.repertoireId)
        );
        return { ...opening, variants, count: variants.length };
      })
      .filter((o) => o.variants.length > 0)
      .filter((o) => normalizedSearch.length === 0 || o.opening.toLowerCase().includes(normalizedSearch))
      .filter((o) => o.variants.reduce((sum, v) => sum + v.errors, 0) >= minErrors)
      .sort((a, b) => {
        if (errorSortBy === "name") return a.opening.localeCompare(b.opening);
        if (errorSortBy === "variants") return b.count - a.count;
        const ea = a.variants.reduce((s, v) => s + v.errors, 0);
        const eb = b.variants.reduce((s, v) => s + v.errors, 0);
        return eb - ea;
      });
  }, [errorsData, minErrors, searchTerm, selectedRepertoires, errorSortBy]);

  const unreviewedData = useMemo(
    () => generateUnreviewedVariantsByOpening(filteredRepertoires),
    [filteredRepertoires]
  );

  const filteredUnreviewed = useMemo<OpeningWithUnreviewedVariants[]>(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return unreviewedData
      .map((opening) => {
        const variants = opening.variants.filter((v) =>
          selectedRepertoires.length === 0 ? true : selectedRepertoires.includes(v.repertoireId)
        );
        return { ...opening, variants, count: variants.length };
      })
      .filter((o) => o.variants.length > 0)
      .filter((o) => normalizedSearch.length === 0 || o.opening.toLowerCase().includes(normalizedSearch))
      .filter((o) => o.count >= minUnreviewed)
      .sort((a, b) => {
        if (unreviewedSortBy === "name") return a.opening.localeCompare(b.opening);
        return b.count - a.count;
      });
  }, [unreviewedData, minUnreviewed, searchTerm, selectedRepertoires, unreviewedSortBy]);

  const errorsSummary = useMemo(() => {
    const totalErrors = filteredErrors.reduce(
      (sum, o) => sum + o.variants.reduce((acc, v) => acc + v.errors, 0),
      0
    );
    const totalErrorVariants = filteredErrors.reduce((sum, o) => sum + o.variants.length, 0);
    return { totalErrors, totalErrorVariants, totalOpenings: filteredErrors.length };
  }, [filteredErrors]);

  const unreviewedSummary = useMemo(() => {
    const totalUnreviewed = filteredUnreviewed.reduce((sum, o) => sum + o.variants.length, 0);
    return { totalUnreviewed, totalOpenings: filteredUnreviewed.length };
  }, [filteredUnreviewed]);

  const totalMastered = allProgressData.reduce((sum, o) => sum + o.mastered, 0);
  const totalWithProblems = allProgressData.reduce((sum, o) => sum + o.withProblems, 0);
  const totalVariants = allProgressData.reduce((sum, o) => sum + o.totalVariants, 0);
  const overallRatio = totalVariants > 0 ? Math.round((totalMastered / totalVariants) * 100) : 0;

  const rawTotalErrors = errorsData.reduce(
    (s, o) => s + o.variants.reduce((a, v) => a + v.errors, 0),
    0
  );
  const rawTotalUnreviewed = unreviewedData.reduce((s, o) => s + o.variants.length, 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "opening" ? "asc" : "desc");
    }
  };

  const handleOpeningClick = (openingName: string) => {
    const repertoireId = openingIndex.openingToRepertoireId.get(openingName);
    if (repertoireId) {
      goToTrainRepertoire(repertoireId, openingName);
    }
  };

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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <header className="mb-4">
        <h2 className="font-bold text-text-base text-2xl leading-tight mb-1">
          Overview
        </h2>
        <p className="text-text-muted text-base leading-snug mb-3">
          Progress, errors, and unreviewed variants across your openings.
        </p>

        <Tabs variant="underline" className="mb-4">
          <TabButton variant="underline" active={view === "progress"} onClick={() => setView("progress")}>
            Progress
          </TabButton>
          <TabButton variant="underline" active={view === "errors"} onClick={() => setView("errors")}>
            Errors
            {rawTotalErrors > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-danger/15 px-1.5 py-0.5 text-xs font-medium text-danger">
                {rawTotalErrors}
              </span>
            )}
          </TabButton>
          <TabButton variant="underline" active={view === "unreviewed"} onClick={() => setView("unreviewed")}>
            Unreviewed
            {rawTotalUnreviewed > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning">
                {rawTotalUnreviewed}
              </span>
            )}
          </TabButton>
        </Tabs>

        <div className="flex flex-wrap gap-2 mb-3">
          {(["all", "white", "black"] as OrientationFilter[]).map((option) => (
            <Button
              key={option}
              intent={filter === option ? "primary" : "secondary"}
              size="xs"
              onClick={() => setFilter(option)}
            >
              {option === "all" ? "All" : option === "white" ? "White" : "Black"}
            </Button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Search opening..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          {view === "progress" && (
            <div className="flex items-center gap-2">
              <label className="text-text-subtle text-sm whitespace-nowrap">Min:</label>
              <Select value={minVariants} onChange={(e) => setMinVariants(Number(e.target.value))}>
                <option value={1}>1+</option>
                <option value={3}>3+</option>
                <option value={5}>5+</option>
                <option value={10}>10+</option>
              </Select>
            </div>
          )}

          {view === "errors" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-text-subtle text-sm whitespace-nowrap">Min errors:</label>
                <Input
                  type="number"
                  min={0}
                  value={minErrors}
                  onChange={(e) => setMinErrors(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20"
                />
              </div>
              <Select
                value={errorSortBy}
                onChange={(e) => setErrorSortBy(e.target.value as ErrorSortOption)}
              >
                <option value="errors">Sort: Total errors</option>
                <option value="variants">Sort: Error variants</option>
                <option value="name">Sort: Name</option>
              </Select>
            </>
          )}

          {view === "unreviewed" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-text-subtle text-sm whitespace-nowrap">Min:</label>
                <Input
                  type="number"
                  min={0}
                  value={minUnreviewed}
                  onChange={(e) => setMinUnreviewed(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20"
                />
              </div>
              <Select
                value={unreviewedSortBy}
                onChange={(e) => setUnreviewedSortBy(e.target.value as UnreviewedSortOption)}
              >
                <option value="unreviewed">Sort: Count</option>
                <option value="name">Sort: Name</option>
              </Select>
            </>
          )}
        </div>

        {(view === "errors" || view === "unreviewed") && (
          <div className="mt-3">
            <RepertoireFilterDropdown
              filteredRepertoires={filteredRepertoires}
              orientationFilter={filter}
              selectedRepertoires={selectedRepertoires}
              setSelectedRepertoires={setSelectedRepertoires}
            />
          </div>
        )}
      </header>

      {view === "progress" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-surface-raised rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-brand">{allProgressData.length}</div>
              <div className="text-xs text-text-subtle">Openings</div>
            </div>
            <div className="bg-surface-raised rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-success">{totalMastered}</div>
              <div className="text-xs text-text-subtle">Mastered</div>
            </div>
            <div className="bg-surface-raised rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-danger">{totalWithProblems}</div>
              <div className="text-xs text-text-subtle">Need Work</div>
            </div>
            <div className="bg-surface-raised rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${getRatioTextColor(overallRatio)}`}>
                {overallRatio}%
              </div>
              <div className="text-xs text-text-subtle">Overall</div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {filteredAndSortedProgress.length === 0 ? (
              <div className="text-text-subtle text-center py-8">No openings found</div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-surface">
                      <tr className="border-b border-border-default">
                        {([
                          ["opening", "Opening"],
                          ["totalVariants", "Total"],
                          ["mastered", "Mastered"],
                          ["withProblems", "Problems"],
                          ["ratio", "Progress"],
                        ] as [SortField, string][]).map(([field, label]) => (
                          <th
                            key={field}
                            className={`${field === "opening" ? "text-left" : "text-center"} py-2 px-2 text-text-subtle font-medium cursor-pointer hover:text-text-muted focus:outline-none focus:text-text-muted ${field === "ratio" ? "w-40" : ""}`}
                            onClick={() => handleSort(field)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSort(field);
                              }
                            }}
                            role="button"
                          >
                            {label} {getSortIcon(field)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedProgress.map((item) => (
                        <tr
                          key={item.opening}
                          className="border-b border-border-subtle hover:bg-surface-raised cursor-pointer focus:outline-none focus:bg-surface-raised"
                          onClick={() => handleOpeningClick(item.opening)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleOpeningClick(item.opening);
                            }
                          }}
                          role="button"
                        >
                          <td className="py-2 px-2 text-text-muted truncate max-w-[250px]" title={item.opening}>
                            {item.opening}
                          </td>
                          <td className="py-2 px-2 text-center text-text-muted">{item.totalVariants}</td>
                          <td className="py-2 px-2 text-center text-success">{item.mastered}</td>
                          <td className="py-2 px-2 text-center text-danger">{item.withProblems}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-interactive rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getRatioColor(item.ratio)} transition-all`}
                                  style={{ width: `${item.ratio}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium w-10 text-right ${getRatioTextColor(item.ratio)}`}>
                                {item.ratio}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-2">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Button
                      intent={sortField === "ratio" ? "primary" : "secondary"}
                      size="xs"
                      onClick={() => handleSort("ratio")}
                    >
                      Progress {sortField === "ratio" && getSortIcon("ratio")}
                    </Button>
                    <Button
                      intent={sortField === "totalVariants" ? "primary" : "secondary"}
                      size="xs"
                      onClick={() => handleSort("totalVariants")}
                    >
                      Total {sortField === "totalVariants" && getSortIcon("totalVariants")}
                    </Button>
                    <Button
                      intent={sortField === "opening" ? "primary" : "secondary"}
                      size="xs"
                      onClick={() => handleSort("opening")}
                    >
                      Name {sortField === "opening" && getSortIcon("opening")}
                    </Button>
                  </div>

                  {filteredAndSortedProgress.map((item) => (
                    <div
                      key={item.opening}
                      className="bg-surface-raised rounded-lg p-3 cursor-pointer hover:bg-interactive focus:outline-none focus:ring-2 focus:ring-brand"
                      onClick={() => handleOpeningClick(item.opening)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpeningClick(item.opening);
                        }
                      }}
                      role="button"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-text-muted text-sm font-medium truncate flex-1 mr-2" title={item.opening}>
                          {item.opening}
                        </span>
                        <span className={`text-sm font-bold ${getRatioTextColor(item.ratio)}`}>
                          {item.ratio}%
                        </span>
                      </div>
                      <div className="h-2 bg-interactive rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${getRatioColor(item.ratio)} transition-all`}
                          style={{ width: `${item.ratio}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-subtle">{item.totalVariants} variants</span>
                        <span className="text-success">{item.mastered} ✓</span>
                        <span className="text-danger">{item.withProblems} ✗</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs text-text-subtle text-center">
                  Showing {filteredAndSortedProgress.length} of {allProgressData.length} openings
                </div>
              </>
            )}
          </div>
        </>
      )}

      {view === "errors" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
              <span className="text-3xl font-bold text-danger">{errorsSummary.totalErrors}</span>
              <span className="text-text-muted mt-1">Total Errors</span>
            </div>
            <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
              <span className="text-3xl font-bold text-warning">{errorsSummary.totalErrorVariants}</span>
              <span className="text-text-muted mt-1">Variants With Errors</span>
            </div>
            <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
              <span className="text-3xl font-bold text-brand">{errorsSummary.totalOpenings}</span>
              <span className="text-text-muted mt-1">Openings With Errors</span>
            </div>
          </div>

          <div className="flex-none sm:flex-1 sm:min-h-0 overflow-visible sm:overflow-y-auto">
            <ExpandableVariantsChart
              data={filteredErrors}
              title="Errors by Opening"
              emptyMessage="No openings found with the selected filters"
              isMobile={isMobile}
              onVariantClick={handleVariantClick}
              onVariantsClick={handleVariantsClick}
            />
          </div>
        </>
      )}

      {view === "unreviewed" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
              <span className="text-3xl font-bold text-warning">{unreviewedSummary.totalUnreviewed}</span>
              <span className="text-text-muted mt-1">Unreviewed Variants</span>
            </div>
            <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
              <span className="text-3xl font-bold text-brand">{unreviewedSummary.totalOpenings}</span>
              <span className="text-text-muted mt-1">Openings With Unreviewed</span>
            </div>
          </div>

          <div className="flex-none sm:flex-1 sm:min-h-0 overflow-visible sm:overflow-y-auto">
            <UnreviewedVariantsChart
              data={filteredUnreviewed}
              title="Unreviewed Variants by Opening"
              emptyMessage="No unreviewed variants found with the selected filters"
              isMobile={isMobile}
              onVariantClick={handleVariantClick}
              onVariantsClick={handleVariantsClick}
            />
          </div>
        </>
      )}
    </section>
  );
};
