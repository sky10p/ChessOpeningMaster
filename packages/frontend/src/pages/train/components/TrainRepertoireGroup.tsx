import React from "react";
import { TrainOverviewRepertoire } from "@chess-opening-master/common";
import { Badge, Card } from "../../../components/ui";
import { TrainOpeningListCard } from "./TrainOpeningListCard";
import { cn } from "../../../utils/cn";

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
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    moved: false,
    active: false,
  });
  const suppressClickUntilRef = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: scroller.scrollLeft,
      moved: false,
      active: true,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller || !dragStateRef.current.active) {
      return;
    }
    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    if (Math.abs(deltaX) > 4) {
      if (
        !dragStateRef.current.moved &&
        Math.abs(deltaX) > 6 &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        if (!scroller.hasPointerCapture(event.pointerId)) {
          scroller.setPointerCapture(event.pointerId);
        }
        setIsDragging(true);
        dragStateRef.current.startScrollLeft = scroller.scrollLeft;
        dragStateRef.current.startX = event.clientX;
      }
      dragStateRef.current.moved =
        dragStateRef.current.moved ||
        (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY));
    }
    if (!dragStateRef.current.moved) {
      return;
    }
    const dragDeltaX = event.clientX - dragStateRef.current.startX;
    scroller.scrollLeft = dragStateRef.current.startScrollLeft - dragDeltaX;
    event.preventDefault();
  };

  const handlePointerEnd = () => {
    if (!dragStateRef.current.active) {
      return;
    }
    if (dragStateRef.current.moved) {
      suppressClickUntilRef.current = performance.now() + 180;
    }
    const scroller = scrollerRef.current;
    if (scroller && scroller.hasPointerCapture(dragStateRef.current.pointerId)) {
      scroller.releasePointerCapture(dragStateRef.current.pointerId);
    }
    dragStateRef.current.moved = false;
    dragStateRef.current.active = false;
    setIsDragging(false);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (performance.now() > suppressClickUntilRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

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
              {dueVariants + dueMistakes} due
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onClickCapture={handleClickCapture}
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
