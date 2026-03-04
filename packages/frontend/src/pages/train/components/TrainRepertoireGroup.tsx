import React from "react";
import { TrainOverviewRepertoire } from "@chess-opening-master/common";
import { Badge, Card } from "../../../components/ui";
import { TrainOpeningListCard } from "./TrainOpeningListCard";
import { cn } from "../../../utils/cn";
import { useHorizontalDragScroll } from "../../../hooks/useHorizontalDragScroll";

interface TrainRepertoireGroupProps {
  group: TrainOverviewRepertoire;
}

export const TrainRepertoireGroup: React.FC<TrainRepertoireGroupProps> = ({ group }) => {
  const dueVariants = group.openings.reduce(
    (sum, opening) => sum + opening.dueVariantsCount,
    0
  );
  const dueMistakes = group.openings.reduce(
    (sum, opening) => sum + opening.dueMistakesCount,
    0
  );
  const { scrollerRef, isDragging, scrollerProps } = useHorizontalDragScroll();

  return (
    <Card padding="default" elevation="raised" className="border-border-default bg-surface">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold leading-tight text-text-base">
              {group.repertoireName}
            </h2>
            <p className="text-xs text-text-subtle">
              {group.orientation === "black" ? "Black repertoire" : "White repertoire"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">
              {group.openings.length} openings
            </Badge>
            <Badge variant="warning" size="sm">
              {dueVariants + dueMistakes} Due
            </Badge>
          </div>
        </div>
        <p className="text-xs text-text-muted">Drag cards horizontally or use trackpad.</p>
        <div className="relative rounded-xl border border-border-subtle bg-surface-raised p-2">
          <div
            ref={scrollerRef}
            className={cn(
              "flex gap-3 overflow-x-auto overflow-y-hidden pb-1 pr-1",
              isDragging ? "cursor-grabbing select-none" : "md:cursor-grab"
            )}
            {...scrollerProps}
          >
            {group.openings.map((opening) => (
              <div
                key={`${group.repertoireId}::${opening.openingName}`}
                className="shrink-0"
              >
                <TrainOpeningListCard opening={opening} />
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
