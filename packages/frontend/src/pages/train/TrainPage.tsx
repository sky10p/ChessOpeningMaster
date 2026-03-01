import React, { useEffect, useMemo, useState } from "react";
import {
  TrainOverviewResponse,
} from "@chess-opening-master/common";
import { Input, Card, EmptyState } from "../../components/ui";
import { getTrainOverview } from "../../repository/train/train";
import { TrainRepertoireGroup } from "./components/TrainRepertoireGroup";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";

const filterOverview = (
  overview: TrainOverviewResponse,
  query: string
): TrainOverviewResponse => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return overview;
  }
  return {
    repertoires: overview.repertoires
      .map((group) => ({
        ...group,
        openings: group.openings.filter(
          (opening) =>
            opening.openingName.toLowerCase().includes(normalized) ||
            group.repertoireName.toLowerCase().includes(normalized)
        ),
      }))
      .filter((group) => group.openings.length > 0),
  };
};

const TrainPage: React.FC = () => {
  const [overview, setOverview] = useState<TrainOverviewResponse>({ repertoires: [] });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setStatus("loading");
        const payload = await getTrainOverview();
        if (!ignore) {
          setOverview(payload);
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

  const filtered = useMemo(() => filterOverview(overview, query), [overview, query]);
  const totals = useMemo(() => {
    const allOpenings = filtered.repertoires.flatMap((group) => group.openings);
    const dueVariants = allOpenings.reduce((sum, opening) => sum + opening.dueVariantsCount, 0);
    const dueMistakes = allOpenings.reduce((sum, opening) => sum + opening.dueMistakesCount, 0);
    return {
      openings: allOpenings.length,
      dueVariants,
      dueMistakes,
    };
  }, [filtered]);

  return (
    <PageRoot>
      <PageFrame className="h-full py-0 sm:py-2">
        <PageSurface>
          <header className="shrink-0 border-b border-border-default bg-surface px-4 py-3 sm:px-5">
            <h1 className="text-2xl font-semibold text-text-base">Train</h1>
            <p className="mt-1 text-sm text-text-muted">
              Pick an opening card to review its full training summary and start normal, focus, or mistakes-only mode.
            </p>
            <div className="mt-3 max-w-xl">
              <Input
                label="Search repertoire or opening"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sicilian, French, Najdorf..."
              />
            </div>
            {status === "success" ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Openings</div>
                  <div className="text-base font-semibold text-text-base">{totals.openings}</div>
                </div>
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Due Variants</div>
                  <div className="text-base font-semibold text-text-base">{totals.dueVariants}</div>
                </div>
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Due Mistakes</div>
                  <div className="text-base font-semibold text-text-base">{totals.dueMistakes}</div>
                </div>
              </div>
            ) : null}
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5">
            {status === "loading" ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className="h-28 animate-pulse border-border-subtle bg-surface-raised"
                  />
                ))}
              </div>
            ) : null}

            {status === "error" ? (
              <EmptyState
                title="Unable to load train overview"
                description="Try again in a moment."
              />
            ) : null}

            {status === "success" && filtered.repertoires.length === 0 ? (
              <EmptyState
                title="No openings match your filters"
                description="Try a broader search query."
              />
            ) : null}

            {status === "success" ? (
              <div className="space-y-4">
                {filtered.repertoires.map((group) => (
                  <TrainRepertoireGroup
                    key={group.repertoireId}
                    group={group}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};

export default TrainPage;
