import React from "react";
import { Button } from "../../../components/ui";

export type VariantWithErrors = {
  fullName: string;
  errors: number;
  repertoireId: string;
  repertoireName: string;
};

export type OpeningWithVariants = {
  opening: string;
  count: number;
  variants: VariantWithErrors[];
};

export interface ExpandableVariantsChartProps {
  data: OpeningWithVariants[];
  title: string;
  emptyMessage?: string;
  isMobile: boolean;
  onVariantClick?: (variantFullName: string) => void;
  onVariantsClick?: (repertoireId: string, variantFullNames: string[]) => void;
}

export const ExpandableVariantsChart: React.FC<ExpandableVariantsChartProps> = ({
  data,
  title,
  emptyMessage = "No data",
  isMobile,
  onVariantClick,
  onVariantsClick,
}) => {
  const [expandedOpenings, setExpandedOpenings] = React.useState<Set<string>>(new Set());

  const toggleOpening = (opening: string) => {
    setExpandedOpenings((prev) => {
      const next = new Set(prev);
      if (next.has(opening)) {
        next.delete(opening);
      } else {
        next.add(opening);
      }
      return next;
    });
  };

  const handleVariantTrain = (variantFullName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onVariantClick?.(variantFullName);
  };

  return (
    <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col">
      <h3 className="text-lg font-semibold text-text-muted mb-2">{title}</h3>
      {data.length === 0 ? (
        <div className="text-text-subtle text-center py-8">{emptyMessage}</div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => {
            const isExpanded = expandedOpenings.has(item.opening);
            const displayName = isMobile && item.opening.length > 25
              ? item.opening.slice(0, 22) + "…"
              : item.opening;
            const totalErrors = item.variants.reduce((sum, variant) => sum + variant.errors, 0);
            const groupedVariants = item.variants.reduce<Record<string, VariantWithErrors[]>>((acc, variant) => {
              if (!acc[variant.repertoireId]) {
                acc[variant.repertoireId] = [];
              }
              acc[variant.repertoireId].push(variant);
              return acc;
            }, {});
            const groupedEntries = Object.entries(groupedVariants);
            
            return (
              <div key={item.opening} className="border border-border-default rounded-lg overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleOpening(item.opening)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleOpening(item.opening);
                    }
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-surface-raised transition-colors text-left"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-text-muted flex-shrink-0">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className="text-text-muted text-sm truncate" title={item.opening}>
                      {displayName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-danger font-semibold">
                      {totalErrors} error{totalErrors !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-text-subtle">
                      {item.count} variant{item.count !== 1 ? "s" : ""} with errors
                    </span>
                    {onVariantsClick && groupedEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {groupedEntries.map(([repertoireId, variants]) => (
                          <Button
                            key={repertoireId}
                            intent="primary"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVariantsClick(repertoireId, variants.map((v) => v.fullName));
                            }}
                            title={`Train all errors for ${variants[0]?.repertoireName || "Repertoire"}`}
                          >
                            Train all errors
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3 py-2 bg-surface-raised border-t border-border-default">
                    {groupedEntries.map(([repertoireId, variants]) => {
                      const repertoireName = variants[0]?.repertoireName || "Repertoire";
                      return (
                        <div key={repertoireId} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-text-muted font-medium truncate" title={repertoireName}>
                              {repertoireName}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {variants.map((variant) => {
                              const shortName = variant.fullName.length > 50
                                ? variant.fullName.slice(0, 47) + "…"
                                : variant.fullName;
                              
                              return (
                                <div
                                  key={`${variant.repertoireId}::${variant.fullName}`}
                                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-interactive text-xs"
                                >
                                  <span className="text-text-muted truncate flex-1 mr-2" title={variant.fullName}>
                                    {shortName}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {onVariantClick && (
                                      <Button
                                        intent="accent"
                                        size="xs"
                                        onClick={(e) => handleVariantTrain(variant.fullName, e)}
                                        title="Train this variant"
                                      >
                                        Train
                                      </Button>
                                    )}
                                    <span className="text-danger font-semibold">
                                      {variant.errors} error{variant.errors !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
