import React from "react";
import { OpeningProgressData } from "../types";
import { getRatioColor, getRatioTextColor } from "../utils";

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
  const titleColor = isNeedWork ? "text-red-400" : "text-green-400";

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
        {onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View all →
          </button>
        )}
      </div>

      {top5.length === 0 ? (
        <div className="text-gray-400 text-center py-4 text-sm">No data</div>
      ) : (
        <div className="space-y-1">
          {top5.map((item) => (
            <div
              key={item.opening}
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-800 px-2 rounded"
              onClick={() => onOpeningClick?.(item.opening)}
            >
              <span className="text-gray-300 text-sm truncate flex-1" title={item.opening}>
                {item.opening.length > 22 ? item.opening.slice(0, 20) + "…" : item.opening}
              </span>
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
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

      <div className="mt-auto pt-3 text-xs text-gray-500 text-center">
        {data.length} openings total
      </div>
    </div>
  );
};
