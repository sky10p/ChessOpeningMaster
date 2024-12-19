import React from "react";
import { TrainVariant } from "../../../models/chess.models";
import { VARIANT_COLORS } from "./utils";
import { TrainVariantInfo } from "./models";

interface VariantsProgressBarProps {
  variants: TrainVariant[];
  variantInfo: Record<string, TrainVariantInfo>;
}

export const VariantsProgressBar: React.FC<VariantsProgressBarProps> = ({
  variants,
  variantInfo,
}) => {
  const totalVariants = variants.length;

  const counts = {
    noErrors: 0,
    oneError: 0,
    twoErrors: 0,
    moreThanTwoErrors: 0,
    unresolved: 0,
  };

  variants.forEach((variant) => {
    const info = variantInfo[variant.variant.fullName];
    if (info === undefined) {
      counts.unresolved++;
    } else if (info.errors === 0) {
      counts.noErrors++;
    } else if (info.errors === 1) {
      counts.oneError++;
    } else if (info.errors === 2) {
      counts.twoErrors++;
    } else {
      counts.moreThanTwoErrors++;
    }
  });

  const getPercentage = (count: number) => (count / totalVariants) * 100;

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <svg
        width="100%"
        height="16"
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #ccc",
        }}
      >
        <rect
          x="0"
          y="0"
          width={`${getPercentage(counts.noErrors)}%`}
          height="16"
          fill={VARIANT_COLORS.noErrors}
        />
        {counts.noErrors > 0 && (
          <text
            x={`${getPercentage(counts.noErrors) / 2}%`}
            y="12"
            textAnchor="middle"
            fontSize="12"
          >
            {counts.noErrors}
          </text>
        )}
        <rect
          x={`${getPercentage(counts.noErrors)}%`}
          y="0"
          width={`${getPercentage(counts.oneError)}%`}
          height="16"
          fill={VARIANT_COLORS.oneError}
        />
        {counts.oneError > 0 && (
          <text
            x={`${getPercentage(counts.noErrors + counts.oneError / 2)}%`}
            y="12"
            textAnchor="middle"
            fontSize="12"
          >
            {counts.oneError}
          </text>
        )}
        <rect
          x={`${getPercentage(counts.noErrors + counts.oneError)}%`}
          y="0"
          width={`${getPercentage(counts.twoErrors)}%`}
          height="16"
          fill={VARIANT_COLORS.twoErrors}
        />
        {counts.twoErrors > 0 && (
          <text
            x={`${getPercentage(
              counts.noErrors + counts.oneError + counts.twoErrors / 2
            )}%`}
            y="12"
            textAnchor="middle"
            fontSize="12"
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
          height="16"
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
            y="12"
            textAnchor="middle"
            fontSize="12"
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
          height="16"
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
            y="12"
            textAnchor="middle"
            fontSize="12"
          >
            {counts.unresolved}
          </text>
        )}
      </svg>
    </div>
  );
};
