import React, { useState, useMemo } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { useNavigationUtils } from "../../../utils/navigationUtils";
import { OrientationFilter } from "./DashboardSection/types";
import { getRatioColor, getRatioTextColor, generateAllOpeningsProgress } from "./DashboardSection/utils";
import { buildDashboardOpeningIndex } from "../utils/openingIndex";

type SortField = "opening" | "totalVariants" | "mastered" | "withProblems" | "ratio";
type SortDirection = "asc" | "desc";

interface OverviewSectionProps {
  repertoires: IRepertoireDashboard[];
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  repertoires,
}) => {
  const { goToTrainRepertoire } = useNavigationUtils();
  const [filter, setFilter] = useState<OrientationFilter>("all");
  const [sortField, setSortField] = useState<SortField>("ratio");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [minVariants, setMinVariants] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRepertoires = useMemo(() => {
    if (filter === "white") return repertoires.filter((r) => r.orientation === "white");
    if (filter === "black") return repertoires.filter((r) => r.orientation === "black");
    return repertoires;
  }, [repertoires, filter]);

  const openingIndex = useMemo(
    () => buildDashboardOpeningIndex(filteredRepertoires),
    [filteredRepertoires]
  );

  const allData = useMemo(
    () => generateAllOpeningsProgress(filteredRepertoires, "all"),
    [filteredRepertoires]
  );

  const filteredAndSortedData = useMemo(() => {
    return allData
      .filter((item) => item.totalVariants >= minVariants)
      .filter((item) =>
        item.opening.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
  }, [allData, sortField, sortDirection, minVariants, searchTerm]);

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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const totalMastered = allData.reduce((sum, o) => sum + o.mastered, 0);
  const totalWithProblems = allData.reduce((sum, o) => sum + o.withProblems, 0);
  const totalVariants = allData.reduce((sum, o) => sum + o.totalVariants, 0);
  const overallRatio = totalVariants > 0 ? Math.round((totalMastered / totalVariants) * 100) : 0;

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
      <header className="mb-4">
        <h2 className="font-bold text-text-base text-2xl leading-tight mb-1">
          Openings Overview
        </h2>
        <p className="text-text-muted text-base leading-snug mb-3">
          Complete progress view of all your openings.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-raised rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{allData.length}</div>
            <div className="text-xs text-text-subtle">Openings</div>
          </div>
          <div className="bg-surface-raised rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{totalMastered}</div>
            <div className="text-xs text-text-subtle">Mastered</div>
          </div>
          <div className="bg-surface-raised rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{totalWithProblems}</div>
            <div className="text-xs text-text-subtle">Need Work</div>
          </div>
          <div className="bg-surface-raised rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${getRatioTextColor(overallRatio)}`}>{overallRatio}%</div>
            <div className="text-xs text-text-subtle">Overall</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded text-sm ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-surface-raised text-text-muted hover:bg-interactive"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("white")}
            className={`px-3 py-1 rounded text-sm ${
              filter === "white"
                ? "bg-blue-600 text-white"
                : "bg-surface-raised text-text-muted hover:bg-interactive"
            }`}
          >
            White
          </button>
          <button
            onClick={() => setFilter("black")}
            className={`px-3 py-1 rounded text-sm ${
              filter === "black"
                ? "bg-blue-600 text-white"
                : "bg-surface-raised text-text-muted hover:bg-interactive"
            }`}
          >
            Black
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search opening..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-surface-raised border border-border-default rounded text-text-muted text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center gap-2">
            <label className="text-text-subtle text-sm whitespace-nowrap">Min:</label>
            <select
              value={minVariants}
              onChange={(e) => setMinVariants(Number(e.target.value))}
              className="px-2 py-2 bg-surface-raised border border-border-default rounded text-text-muted text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={1}>1+</option>
              <option value={3}>3+</option>
              <option value={5}>5+</option>
              <option value={10}>10+</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        {filteredAndSortedData.length === 0 ? (
          <div className="text-text-subtle text-center py-8">No openings found</div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border-default">
                    <th
                      className="text-left py-2 px-2 text-text-subtle font-medium cursor-pointer hover:text-text-muted focus:outline-none focus:text-text-muted"
                      onClick={() => handleSort("opening")}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSort("opening");
                        }
                      }}
                      role="button"
                    >
                      Opening {getSortIcon("opening")}
                    </th>
                    <th
                      className="text-center py-2 px-2 text-text-subtle font-medium cursor-pointer hover:text-text-muted focus:outline-none focus:text-text-muted"
                      onClick={() => handleSort("totalVariants")}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSort("totalVariants");
                        }
                      }}
                      role="button"
                    >
                      Total {getSortIcon("totalVariants")}
                    </th>
                    <th
                      className="text-center py-2 px-2 text-text-subtle font-medium cursor-pointer hover:text-text-muted focus:outline-none focus:text-text-muted"
                      onClick={() => handleSort("mastered")}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSort("mastered");
                        }
                      }}
                      role="button"
                    >
                      Mastered {getSortIcon("mastered")}
                    </th>
                    <th
                      className="text-center py-2 px-2 text-text-subtle font-medium cursor-pointer hover:text-text-muted focus:outline-none focus:text-text-muted"
                      onClick={() => handleSort("withProblems")}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSort("withProblems");
                        }
                      }}
                      role="button"
                    >
                      Problems {getSortIcon("withProblems")}
                    </th>
                    <th
                      className="text-center py-2 px-2 text-text-subtle font-medium cursor-pointer hover:text-text-muted focus:outline-none focus:text-text-muted w-40"
                      onClick={() => handleSort("ratio")}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSort("ratio");
                        }
                      }}
                      role="button"
                    >
                      Progress {getSortIcon("ratio")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((item) => (
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
                      <td className="py-2 px-2 text-center text-text-muted">
                        {item.totalVariants}
                      </td>
                      <td className="py-2 px-2 text-center text-green-400">
                        {item.mastered}
                      </td>
                      <td className="py-2 px-2 text-center text-red-400">
                        {item.withProblems}
                      </td>
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
                <button
                  onClick={() => handleSort("ratio")}
                  className={`px-2 py-1 text-xs rounded ${
                    sortField === "ratio" ? "bg-blue-600 text-white" : "bg-surface-raised text-text-muted"
                  }`}
                >
                  Progress {sortField === "ratio" && getSortIcon("ratio")}
                </button>
                <button
                  onClick={() => handleSort("totalVariants")}
                  className={`px-2 py-1 text-xs rounded ${
                    sortField === "totalVariants" ? "bg-blue-600 text-white" : "bg-surface-raised text-text-muted"
                  }`}
                >
                  Total {sortField === "totalVariants" && getSortIcon("totalVariants")}
                </button>
                <button
                  onClick={() => handleSort("opening")}
                  className={`px-2 py-1 text-xs rounded ${
                    sortField === "opening" ? "bg-blue-600 text-white" : "bg-surface-raised text-text-muted"
                  }`}
                >
                  Name {sortField === "opening" && getSortIcon("opening")}
                </button>
              </div>

              {filteredAndSortedData.map((item) => (
                <div
                  key={item.opening}
                  className="bg-surface-raised rounded-lg p-3 cursor-pointer hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span className="text-green-400">{item.mastered} ✓</span>
                    <span className="text-red-400">{item.withProblems} ✗</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-xs text-text-subtle text-center">
              Showing {filteredAndSortedData.length} of {allData.length} openings
            </div>
          </>
        )}
      </div>
    </section>
  );
};
