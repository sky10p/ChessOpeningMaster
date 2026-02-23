import React from "react";
import { Link } from "react-router-dom";
import { TrainOpeningSummary } from "@chess-opening-master/common";
import { Badge, Card } from "../../../components/ui";
import { StaticChessboard } from "../../../components/design/chess/StaticChessboard";

interface TrainOpeningListCardProps {
  opening: TrainOpeningSummary;
}

const FALLBACK_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const getMasteryBadge = (
  score: number
): { label: string; variant: "success" | "warning" | "brand" } => {
  if (score >= 85) {
    return { label: "Mastered", variant: "success" };
  }
  if (score >= 55) {
    return { label: "In Progress", variant: "brand" };
  }
  return { label: "Needs Work", variant: "warning" };
};

export const TrainOpeningListCard: React.FC<TrainOpeningListCardProps> = ({ opening }) => {
  const mastery = getMasteryBadge(opening.masteryScore);
  const dueTotal = opening.dueVariantsCount + opening.dueMistakesCount;

  return (
    <Card
      className="w-[21rem] min-w-[21rem] border-border-default bg-surface"
      elevation="high"
      interactive
      padding="none"
    >
      <Link
        to={`/train/repertoire/${opening.repertoireId}/opening/${encodeURIComponent(
          opening.openingName
        )}`}
        className="block p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label={`Open ${opening.openingName} training summary`}
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-h-[3.25rem] flex-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-text-base">
              {opening.openingName}
            </h3>
          </div>
          <Badge variant={mastery.variant} size="sm" className="shrink-0">
            {mastery.label}
          </Badge>
        </div>
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-raised">
            <div className="w-full">
              <StaticChessboard
                fen={opening.openingFen || FALLBACK_FEN}
                orientation={opening.orientation || "white"}
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge
                variant={opening.orientation === "black" ? "brand" : "default"}
                size="sm"
              >
                {opening.orientation === "black" ? "Black" : "White"}
              </Badge>
              <Badge variant="brand" size="sm">
                {opening.masteryScore}% mastery
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border-subtle bg-surface-raised px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-text-subtle">Variants</div>
                <div className="text-sm font-semibold text-text-base">
                  {opening.totalVariantsCount}
                </div>
              </div>
              <div className="rounded-md border border-border-subtle bg-surface-raised px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-text-subtle">Total Due</div>
                <div className="text-sm font-semibold text-text-base">{dueTotal}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="warning" size="sm">
                {opening.dueVariantsCount} due variants
              </Badge>
              <Badge variant="danger" size="sm">
                {opening.dueMistakesCount} due mistakes
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
