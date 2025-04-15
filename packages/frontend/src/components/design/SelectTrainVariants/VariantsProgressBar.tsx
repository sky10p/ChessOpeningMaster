import React from "react";
import { TrainVariant } from "../../../models/chess.models";
import { getVariantsProgressInfo, VARIANT_COLORS, VARIANT_TEXT_COLORS } from "./utils";
import { TrainVariantInfo } from "@chess-opening-master/common";

interface VariantsProgressBarProps {
  variants: TrainVariant[];
  variantInfo: Record<string, TrainVariantInfo>;
}

export const VariantsProgressBar: React.FC<VariantsProgressBarProps> = ({
  variants,
  variantInfo,
}) => {
  const { totalVariants, counts } = getVariantsProgressInfo(variants, variantInfo);

  const getPercentage = (count: number) => (count / totalVariants) * 100;

  return (
    <div style={{ width: "100%", textAlign: "center", margin: "8px 0" }}>
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
          width={`${getPercentage(counts.noErrors)}%`}
          height="20"
          fill={VARIANT_COLORS.noErrors}
        />
        {counts.noErrors > 0 && (
          <text
            x={`${getPercentage(counts.noErrors) / 2}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.noErrors}
          >
            {counts.noErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(counts.noErrors)}%`}
          y="0"
          width={`${getPercentage(counts.oneError)}%`}
          height="20"
          fill={VARIANT_COLORS.oneError}
        />
        {counts.oneError > 0 && (
          <text
            x={`${getPercentage(counts.noErrors + counts.oneError / 2)}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.oneError}
          >
            {counts.oneError}
          </text>
        )}
        <rect
          x={`${getPercentage(counts.noErrors + counts.oneError)}%`}
          y="0"
          width={`${getPercentage(counts.twoErrors)}%`}
          height="20"
          fill={VARIANT_COLORS.twoErrors}
        />
        {counts.twoErrors > 0 && (
          <text
            x={`${getPercentage(
              counts.noErrors + counts.oneError + counts.twoErrors / 2
            )}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.twoErrors}
          >
            {counts.twoErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(
            counts.noErrors + counts.oneError + counts.twoErrors
          )}%`}
          y="0"
          width={`${getPercentage(counts.moreThanTwoErrors)}%`}
          height="20"
          fill={VARIANT_COLORS.moreThanTwoErrors}
        />
        {counts.moreThanTwoErrors > 0 && (
          <text
            x={`${getPercentage(
              counts.noErrors +
                counts.oneError +
                counts.twoErrors +
                counts.moreThanTwoErrors / 2
            )}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.moreThanTwoErrors}
          >
            {counts.moreThanTwoErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(
            counts.noErrors +
              counts.oneError +
              counts.twoErrors +
              counts.moreThanTwoErrors
          )}%`}
          y="0"
          width={`${getPercentage(counts.unresolved)}%`}
          height="20"
          fill={VARIANT_COLORS.unresolved}
        />
        {counts.unresolved > 0 && (
          <text
            x={`${getPercentage(
              counts.noErrors +
                counts.oneError +
                counts.twoErrors +
                counts.moreThanTwoErrors +
                counts.unresolved / 2
            )}%`}
            y="14"
            textAnchor="middle"
            fontSize="12"
            fill={VARIANT_TEXT_COLORS.unresolved}
          >
            {counts.unresolved}
          </text>
        )}
      </svg>
    </div>
  );
};
