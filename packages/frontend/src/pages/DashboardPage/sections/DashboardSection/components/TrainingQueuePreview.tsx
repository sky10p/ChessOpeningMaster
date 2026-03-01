import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrainOverviewResponse,
  TrainOpeningSummary,
} from "@chess-opening-master/common";
import { getCachedTrainOverview } from "../../../../../repository/train/train";
import { Badge, Button, MasteryBadge } from "../../../../../components/ui";

function extractDueOpenings(overview: TrainOverviewResponse): TrainOpeningSummary[] {
  return overview.repertoires
    .flatMap((group) =>
      group.openings
        .filter((o) => o.dueVariantsCount > 0 || o.dueMistakesCount > 0)
    )
    .sort((a, b) => b.dueVariantsCount + b.dueMistakesCount - (a.dueVariantsCount + a.dueMistakesCount))
    .slice(0, 5);
}

export const TrainingQueuePreview: React.FC = () => {
  const navigate = useNavigate();
  const [openings, setOpenings] = useState<TrainOpeningSummary[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setStatus("loading");
      try {
        const overview = await getCachedTrainOverview();
        if (!ignore) {
          setOpenings(extractDueOpenings(overview));
          setStatus("success");
        }
      } catch {
        if (!ignore) {
          setStatus("error");
        }
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <div className="rounded-xl border border-border-default bg-surface p-4 animate-pulse">
        <div className="h-5 w-40 rounded bg-surface-raised mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-surface-raised" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return null;
  }

  if (openings.length === 0) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="text-sm font-semibold text-success">Nothing due right now</div>
        <p className="text-xs text-text-muted mt-1">All caught up! Check back later or learn new variants on the Path page.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-base">Training Queue</h3>
        <Button intent="secondary" size="xs" onClick={() => navigate("/train")}>
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {openings.map((opening) => (
          <Button
            key={`${opening.repertoireId}-${opening.openingName}`}
            type="button"
            intent="secondary"
            size="sm"
            className="h-auto w-full justify-between gap-2 rounded-lg px-3 py-2 text-left font-normal hover:border-brand/40"
            onClick={() =>
              navigate(
                `/train/repertoire/${opening.repertoireId}/opening/${encodeURIComponent(opening.openingName)}`
              )
            }
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text-base truncate">{opening.openingName}</div>
              <div className="text-xs text-text-muted truncate">{opening.repertoireName}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <MasteryBadge score={opening.masteryScore} size="sm" />
              {opening.dueVariantsCount > 0 && (
                <Badge variant="warning" size="sm">{opening.dueVariantsCount} Due</Badge>
              )}
              {opening.dueMistakesCount > 0 && (
                <Badge variant="danger" size="sm">{opening.dueMistakesCount} Mistakes</Badge>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
