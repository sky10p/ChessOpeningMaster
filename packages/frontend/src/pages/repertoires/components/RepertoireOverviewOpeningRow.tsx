import React from "react";
import { RepertoireOverviewOpening } from "@chess-opening-master/common";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { StaticChessboard } from "../../../components/design/chess/StaticChessboard";
import { Badge, Button, Card } from "../../../components/ui";
import { START_FEN } from "../../../utils/getOpeningFen";
import { cn } from "../../../utils/cn";
import {
  getDueMistakesTooltip,
  getDueVariantsTooltip,
  getMasteryTooltip,
  getOverviewState,
  OVERVIEW_BADGE_CLASSNAMES,
  RepertoireOverviewBadge,
} from "./RepertoireOverviewBadge";

interface RepertoireOverviewOpeningRowProps {
  opening: RepertoireOverviewOpening;
  disabled: boolean;
  onView: () => void;
  onEdit: () => void;
}

export const RepertoireOverviewOpeningRow: React.FC<RepertoireOverviewOpeningRowProps> = ({
  opening,
  disabled,
  onView,
  onEdit,
}) => {
  const state = getOverviewState(opening.statusCounts, opening.dueMistakesCount);

  return (
    <Card
      padding="compact"
      elevation="raised"
      className={cn(
        "h-full min-h-[13.75rem] w-[min(24rem,calc(100vw-5.5rem))] min-w-[min(24rem,calc(100vw-5.5rem))] border-border-subtle bg-surface sm:w-[26rem] sm:min-w-[26rem] lg:w-[28rem] lg:min-w-[28rem]",
        disabled && "border-danger/20 opacity-80"
      )}
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex min-h-[8rem] items-stretch gap-3">
          <div className="w-20 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-raised">
            <StaticChessboard
              fen={opening.openingFen || START_FEN}
              orientation={opening.orientation || "white"}
            />
          </div>

          <div className="min-w-0 flex flex-1 flex-col">
            <div className="flex min-h-[3.5rem] items-center justify-between gap-3">
              <h3 className="min-w-0 flex-1 line-clamp-2 text-sm font-semibold leading-tight text-text-base">
                {opening.openingName}
              </h3>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <Button intent="secondary" size="sm" onClick={onView}>
                  View
                </Button>
                <Button intent="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              </div>
            </div>
            <div className="mt-1.5 flex min-h-[3.5rem] flex-wrap content-start items-start gap-2">
              <RepertoireOverviewBadge
                variant={state.variant}
                size="sm"
                label={state.label}
                tooltip={
                  <span className="block space-y-1">
                    <span className="block font-semibold text-text-base">{state.label}</span>
                    <span className="block text-text-muted leading-snug">
                      {state.description}
                    </span>
                  </span>
                }
              />
              <RepertoireOverviewBadge
                variant="default"
                size="sm"
                label={`${Math.round(opening.masteryScore)}% mastery`}
                className={OVERVIEW_BADGE_CLASSNAMES.mastery}
                tooltip={getMasteryTooltip(opening.masteryScore)}
              />
              <Badge
                variant="default"
                size="sm"
                className={OVERVIEW_BADGE_CLASSNAMES.variantsCount}
              >
                {opening.totalVariantsCount} variants
              </Badge>
              {opening.dueVariantsCount > 0 ? (
                <RepertoireOverviewBadge
                  variant="default"
                  size="sm"
                  label={`${opening.dueVariantsCount} due`}
                  className={OVERVIEW_BADGE_CLASSNAMES.dueVariants}
                  tooltip={getDueVariantsTooltip()}
                />
              ) : null}
              {opening.dueMistakesCount > 0 ? (
                <RepertoireOverviewBadge
                  variant="danger"
                  size="sm"
                  label={`${opening.dueMistakesCount} mistakes`}
                  tooltip={getDueMistakesTooltip()}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="pt-0.5">
          <VariantsProgressBar
            counts={{
              noErrors: opening.statusCounts.noErrors,
              oneError: opening.statusCounts.oneError,
              twoErrors: opening.statusCounts.twoErrors,
              moreThanTwoErrors: opening.statusCounts.moreThanTwoErrors,
              unresolved: opening.statusCounts.unresolved,
            }}
            spacing="tight"
          />
        </div>
        <div className="flex shrink-0 gap-2 sm:hidden">
          <Button intent="secondary" size="sm" onClick={onView}>
            View
          </Button>
          <Button intent="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
};
