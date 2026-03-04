import React from "react";
import { RepertoireOverviewItem } from "@chess-opening-master/common";
import { StarIcon as SolidStarIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";
import { StarIcon as OutlineStarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import {
  Badge,
  Button,
  Card,
  IconButton,
} from "../../../components/ui";
import { cn } from "../../../utils/cn";
import { RepertoireOverviewOpeningRow } from "./RepertoireOverviewOpeningRow";
import { useHorizontalDragScroll } from "../../../hooks/useHorizontalDragScroll";
import {
  getDueMistakesTooltip,
  getDueVariantsTooltip,
  getMasteryTooltip,
  getOverviewState,
  OVERVIEW_BADGE_CLASSNAMES,
  RepertoireOverviewBadge,
} from "./RepertoireOverviewBadge";

interface RepertoireOverviewGroupProps {
  repertoire: RepertoireOverviewItem;
  onViewRepertoire: () => void;
  onTrainRepertoire: () => void;
  onToggleFavorite: () => void;
  onToggleDisabled: () => void;
  onViewOpening: (openingName: string) => void;
  onEditOpening: (openingName: string) => void;
  controlsDisabled?: boolean;
}

export const RepertoireOverviewGroup: React.FC<RepertoireOverviewGroupProps> = ({
  repertoire,
  onViewRepertoire,
  onTrainRepertoire,
  onToggleFavorite,
  onToggleDisabled,
  onViewOpening,
  onEditOpening,
  controlsDisabled = false,
}) => {
  const { scrollerRef, isDragging, scrollerProps } = useHorizontalDragScroll();
  const state = getOverviewState(repertoire.statusCounts, repertoire.dueMistakesCount);
  const [openingsExpanded, setOpeningsExpanded] = React.useState(false);

  return (
    <Card
      padding="default"
      elevation="raised"
      className={cn(
        "relative border-border-default bg-surface",
        repertoire.disabled && "border-danger/30 opacity-80"
      )}
    >
      <div className="space-y-3">
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
          <IconButton
            label={repertoire.favorite ? "Remove favourite" : "Mark favourite"}
            onClick={onToggleFavorite}
            disabled={controlsDisabled}
            className={repertoire.favorite ? "text-accent" : "text-text-muted"}
          >
            {repertoire.favorite ? (
              <SolidStarIcon className="h-4 w-4" />
            ) : (
              <OutlineStarIcon className="h-4 w-4" />
            )}
          </IconButton>
          <IconButton
            label={repertoire.disabled ? "Enable repertoire" : "Disable repertoire"}
            onClick={onToggleDisabled}
            disabled={controlsDisabled}
            className={repertoire.disabled ? "text-danger" : "text-success"}
          >
            {repertoire.disabled ? (
              <LockClosedIcon className="h-4 w-4" />
            ) : (
              <LockOpenIcon className="h-4 w-4" />
            )}
          </IconButton>
        </div>
        <div className="pr-20">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-text-base">{repertoire.repertoireName}</h2>
            <Badge
              variant={repertoire.orientation === "black" ? "brand" : "default"}
              size="sm"
            >
              {repertoire.orientation === "black" ? "Black" : "White"}
            </Badge>
            {repertoire.disabled ? (
              <Badge variant="danger" size="sm">
                Disabled
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                Active
              </Badge>
            )}
            {repertoire.favorite ? (
              <Badge
                variant="default"
                size="sm"
                className={OVERVIEW_BADGE_CLASSNAMES.favorite}
              >
                Favourite
              </Badge>
            ) : null}
            <RepertoireOverviewBadge
              variant={state.variant}
              size="sm"
              label={state.label}
              tooltip={
                <span className="block space-y-1">
                  <span className="block font-semibold text-text-base">{state.label}</span>
                  <span className="block text-text-muted leading-snug">{state.description}</span>
                </span>
              }
            />
            <RepertoireOverviewBadge
              variant="default"
              size="sm"
              label={`${Math.round(repertoire.masteryScore)}% mastery`}
              className={OVERVIEW_BADGE_CLASSNAMES.mastery}
              tooltip={getMasteryTooltip(repertoire.masteryScore)}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="default"
              size="sm"
              className={OVERVIEW_BADGE_CLASSNAMES.openingsCount}
            >
              {repertoire.openingCount} openings
            </Badge>
            <Badge
              variant="default"
              size="sm"
              className={OVERVIEW_BADGE_CLASSNAMES.variantsCount}
            >
              {repertoire.totalVariantsCount} variants
            </Badge>
            {repertoire.dueVariantsCount > 0 ? (
              <RepertoireOverviewBadge
                variant="default"
                size="sm"
                label={`${repertoire.dueVariantsCount} due variants`}
                className={OVERVIEW_BADGE_CLASSNAMES.dueVariants}
                tooltip={getDueVariantsTooltip()}
              />
            ) : null}
            {repertoire.dueMistakesCount > 0 ? (
              <RepertoireOverviewBadge
                variant="danger"
                size="sm"
                label={`${repertoire.dueMistakesCount} due mistakes`}
                tooltip={getDueMistakesTooltip()}
              />
            ) : null}
          </div>
          <VariantsProgressBar
            counts={{
              noErrors: repertoire.statusCounts.noErrors,
              oneError: repertoire.statusCounts.oneError,
              twoErrors: repertoire.statusCounts.twoErrors,
              moreThanTwoErrors: repertoire.statusCounts.moreThanTwoErrors,
              unresolved: repertoire.statusCounts.unresolved,
            }}
            className="mt-2"
            spacing="slim"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button intent="secondary" size="sm" onClick={onViewRepertoire}>
            View
          </Button>
          <Button
            intent="primary"
            size="sm"
            onClick={onTrainRepertoire}
            disabled={repertoire.disabled}
          >
            Train
          </Button>
          <Button
            intent="ghost"
            size="sm"
            onClick={() => setOpeningsExpanded((v) => !v)}
            className="ml-auto md:hidden"
          >
            {repertoire.openingCount} openings
            <ChevronDownIcon
              className={cn("h-4 w-4 transition-transform duration-200", openingsExpanded && "rotate-180")}
            />
          </Button>
        </div>
        <div className={cn("relative rounded-xl border border-border-subtle bg-surface-raised p-3", !openingsExpanded && "hidden md:block")}>
          <div
            ref={scrollerRef}
            className={cn(
              "flex gap-3 overflow-x-auto overflow-y-hidden pb-1 pr-1",
              isDragging ? "cursor-grabbing select-none" : "md:cursor-grab"
            )}
            {...scrollerProps}
          >
            {repertoire.openings.map((opening) => (
              <div
                key={`${repertoire.repertoireId}:${opening.openingName}`}
                className="flex shrink-0 self-stretch"
              >
                <RepertoireOverviewOpeningRow
                  opening={opening}
                  disabled={repertoire.disabled}
                  onView={() => onViewOpening(opening.openingName)}
                  onEdit={() => onEditOpening(opening.openingName)}
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-surface-raised to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-surface-raised to-transparent" />
        </div>
      </div>
    </Card>
  );
};
