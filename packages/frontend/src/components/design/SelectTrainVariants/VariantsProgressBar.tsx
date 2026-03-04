import React from "react";
import { TrainVariant } from "../../../models/chess.models";
import {
  getVariantsProgressInfo,
  VARIANT_COLORS,
  VARIANT_TEXT_COLORS,
  VariantInfoKeyResolver,
} from "./utils";
import { TrainVariantInfo } from "@chess-opening-master/common";
import { VariantsProgressCounts } from "./models";

interface VariantsProgressBarProps {
  variants?: TrainVariant[];
  variantInfo?: Record<string, TrainVariantInfo>;
  variantInfoKeyResolver?: VariantInfoKeyResolver;
  counts?: VariantsProgressCounts;
  className?: string;
  spacing?: "default" | "tight" | "slim";
}

export const VariantsProgressBar: React.FC<VariantsProgressBarProps> = ({
  variants,
  variantInfo,
  variantInfoKeyResolver,
  counts,
  className,
  spacing = "default",
}) => {
  const progressInfo =
    counts !== undefined
      ? {
          totalVariants:
            counts.noErrors +
            counts.oneError +
            counts.twoErrors +
            counts.moreThanTwoErrors +
            counts.unresolved,
          counts,
        }
      : getVariantsProgressInfo(
          variants || [],
          variantInfo || {},
          variantInfoKeyResolver
        );

  const totalVariants = Math.max(progressInfo.totalVariants, 1);
  const progressCounts = progressInfo.counts;

  const getPercentage = (count: number) => (count / totalVariants) * 100;

  if (spacing === "slim") {
    return (
      <div className={className} style={{ width: "100%" }}>
        <svg width="100%" height="6" style={{ borderRadius: "4px", overflow: "hidden" }}>
          <rect x="0" y="0" width={`${getPercentage(progressCounts.noErrors)}%`} height="6" fill={VARIANT_COLORS.noErrors} />
          <rect x={`${getPercentage(progressCounts.noErrors)}%`} y="0" width={`${getPercentage(progressCounts.oneError)}%`} height="6" fill={VARIANT_COLORS.oneError} />
          <rect x={`${getPercentage(progressCounts.noErrors + progressCounts.oneError)}%`} y="0" width={`${getPercentage(progressCounts.twoErrors)}%`} height="6" fill={VARIANT_COLORS.twoErrors} />
          <rect x={`${getPercentage(progressCounts.noErrors + progressCounts.oneError + progressCounts.twoErrors)}%`} y="0" width={`${getPercentage(progressCounts.moreThanTwoErrors)}%`} height="6" fill={VARIANT_COLORS.moreThanTwoErrors} />
          <rect x={`${getPercentage(progressCounts.noErrors + progressCounts.oneError + progressCounts.twoErrors + progressCounts.moreThanTwoErrors)}%`} y="0" width={`${getPercentage(progressCounts.unresolved)}%`} height="6" fill={VARIANT_COLORS.unresolved} />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        textAlign: "center",
        margin: spacing === "tight" ? "2px 0 0" : "8px 0",
      }}
    >
      <svg
        width="100%"
        height="20"
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #444",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        <rect
          x="0"
          y="0"
          width={`${getPercentage(progressCounts.noErrors)}%`}
          height="20"
          fill={VARIANT_COLORS.noErrors}
        />
        {progressCounts.noErrors > 0 && (
          <text
            x={`${getPercentage(progressCounts.noErrors) / 2}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.noErrors}
          >
            {progressCounts.noErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(progressCounts.noErrors)}%`}
          y="0"
          width={`${getPercentage(progressCounts.oneError)}%`}
          height="20"
          fill={VARIANT_COLORS.oneError}
        />
        {progressCounts.oneError > 0 && (
          <text
            x={`${getPercentage(progressCounts.noErrors + progressCounts.oneError / 2)}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.oneError}
          >
            {progressCounts.oneError}
          </text>
        )}
        <rect
          x={`${getPercentage(progressCounts.noErrors + progressCounts.oneError)}%`}
          y="0"
          width={`${getPercentage(progressCounts.twoErrors)}%`}
          height="20"
          fill={VARIANT_COLORS.twoErrors}
        />
        {progressCounts.twoErrors > 0 && (
          <text
            x={`${getPercentage(
              progressCounts.noErrors + progressCounts.oneError + progressCounts.twoErrors / 2
            )}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.twoErrors}
          >
            {progressCounts.twoErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(
            progressCounts.noErrors + progressCounts.oneError + progressCounts.twoErrors
          )}%`}
          y="0"
          width={`${getPercentage(progressCounts.moreThanTwoErrors)}%`}
          height="20"
          fill={VARIANT_COLORS.moreThanTwoErrors}
        />
        {progressCounts.moreThanTwoErrors > 0 && (
          <text
            x={`${getPercentage(
              progressCounts.noErrors +
                progressCounts.oneError +
                progressCounts.twoErrors +
                progressCounts.moreThanTwoErrors / 2
            )}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.moreThanTwoErrors}
          >
            {progressCounts.moreThanTwoErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(
            progressCounts.noErrors +
              progressCounts.oneError +
              progressCounts.twoErrors +
              progressCounts.moreThanTwoErrors
          )}%`}
          y="0"
          width={`${getPercentage(progressCounts.unresolved)}%`}
          height="20"
          fill={VARIANT_COLORS.unresolved}
        />
        {progressCounts.unresolved > 0 && (
          <text
            x={`${getPercentage(
              progressCounts.noErrors +
                progressCounts.oneError +
                progressCounts.twoErrors +
                progressCounts.moreThanTwoErrors +
                progressCounts.unresolved / 2
            )}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.unresolved}
          >
            {progressCounts.unresolved}
          </text>
        )}
      </svg>
    </div>
  );
};
