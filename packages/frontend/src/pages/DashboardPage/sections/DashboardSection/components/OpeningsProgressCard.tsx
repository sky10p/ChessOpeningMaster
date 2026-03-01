import React from "react";
import { OpeningProgressData } from "../types";
import { getRatioColor, getRatioTextColor } from "../utils";
import { Button } from "../../../../../components/ui";

interface OpeningsProgressCardProps {
  data: OpeningProgressData[];
  type: "needWork" | "wellLearned";
  onOpeningClick?: (openingName: string) => void;
  onViewAllClick?: () => void;
}

export const OpeningsProgressCard: React.FC<OpeningsProgressCardProps> = ({
  data,
  type,
  onOpeningClick,
  onViewAllClick,
}) => {
  const isNeedWork = type === "needWork";
  const sorted = isNeedWork
    ? [...data].sort((a, b) => a.ratio - b.ratio)
    : [...data].sort((a, b) => b.ratio - a.ratio);
  const top5 = sorted.slice(0, 5);

  const title = isNeedWork ? "Need Work" : "Well Learned";
  const titleColor = isNeedWork ? "text-danger" : "text-success";

  return (
    <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
        {onViewAllClick && (
          <Button
            intent="ghost"
            size="xs"
            onClick={onViewAllClick}
          >
            View all →
          </Button>
        )}
      </div>

      {top5.length === 0 ? (
        <div className="text-text-subtle text-center py-4 text-sm">No data</div>
      ) : (
        <div className="space-y-1">
          {top5.map((item) => (
            <div
              key={item.opening}
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-surface-raised px-2 rounded"
              onClick={() => onOpeningClick?.(item.opening)}
            >
              <span className="text-text-muted text-sm truncate flex-1" title={item.opening}>
                {item.opening.length > 22 ? item.opening.slice(0, 20) + "…" : item.opening}
              </span>
              <div className="w-20 h-2 bg-interactive rounded-full overflow-hidden">
                <div
                  className={`h-full ${getRatioColor(item.ratio)}`}
                  style={{ width: `${item.ratio}%` }}
                />
              </div>
              <span className={`text-sm font-medium w-10 text-right ${getRatioTextColor(item.ratio)}`}>
                {item.ratio}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 text-xs text-text-subtle text-center">
        {data.length} openings total
      </div>
    </div>
  );
};
