import React, { useEffect, useMemo, useState } from "react";
import {
  RepertoireOverviewResponse,
} from "@chess-opening-master/common";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, Button, EmptyState, PageHeader, StatStrip } from "../../components/ui";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { PageSurface } from "../../components/design/layouts/PageSurface";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  getRepertoireOverview,
  updateRepertoirePreferences,
} from "../../repository/repertoires/repertoires";
import { useNavbarDispatch } from "../../contexts/NavbarContext";
import { useAlertContext } from "../../contexts/AlertContext";
import { RepertoireOverviewFilters } from "./components/RepertoireOverviewFilters";
import { RepertoireOverviewGroup } from "./components/RepertoireOverviewGroup";
import {
  applyRepertoireOverviewFilters,
  parseAvailabilityFilter,
  parseFavoritesFilter,
  parseMasteryFilter,
  parseOrientationFilter,
  parseStatusFilter,
} from "./repertoireOverviewFilters";
import {
  getRepertoireEditorRoute,
  getRepertoireOpeningRoute,
  getTrainRepertoireRoute,
} from "../../utils/appRoutes";
import { CreateRepertoireDrawer } from "./components/CreateRepertoireDrawer";

const DEFAULT_OVERVIEW: RepertoireOverviewResponse = { repertoires: [] };

const RepertoiresPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateRepertoires } = useNavbarDispatch();
  const { showAlert } = useAlertContext();
  const isMobile = useIsMobile();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [overview, setOverview] = useState<RepertoireOverviewResponse>(DEFAULT_OVERVIEW);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const query = searchParams.get("q") || "";
  const orientation = parseOrientationFilter(searchParams.get("orientation"));
  const openingStatus = parseStatusFilter(searchParams.get("status"));
  const availability = parseAvailabilityFilter(searchParams.get("availability"));
  const favorites = parseFavoritesFilter(searchParams.get("favorites"));
  const mastery = parseMasteryFilter(searchParams.get("mastery"));
  const createDrawerOpen = searchParams.get("create") === "1";

  const loadOverview = React.useCallback(async () => {
    try {
      setStatus("loading");
      const payload = await getRepertoireOverview();
      setOverview(payload);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const setFilter = React.useCallback(
    (
      key: "q" | "orientation" | "status" | "availability" | "favorites" | "mastery",
      value: string
    ) => {
      const next = new URLSearchParams(searchParams);
      if (!value) {
        next.delete(key);
      } else if (key !== "q" && value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const filteredRepertoires = useMemo(
    () =>
      applyRepertoireOverviewFilters(overview.repertoires, {
        query,
        orientation,
        status: openingStatus,
        availability,
        favorites,
        mastery,
      }),
    [availability, favorites, mastery, openingStatus, orientation, overview.repertoires, query]
  );

  const activeSummary = useMemo(() => {
    const activeRepertoires = filteredRepertoires.filter((repertoire) => !repertoire.disabled);
    return {
      repertoireCount: activeRepertoires.length,
      openingCount: activeRepertoires.reduce((sum, repertoire) => sum + repertoire.openings.length, 0),
      dueVariantsCount: activeRepertoires.reduce(
        (sum, repertoire) => sum + repertoire.openings.reduce((inner, opening) => inner + opening.dueVariantsCount, 0),
        0
      ),
      dueMistakesCount: activeRepertoires.reduce(
        (sum, repertoire) => sum + repertoire.openings.reduce((inner, opening) => inner + opening.dueMistakesCount, 0),
        0
      ),
    };
  }, [filteredRepertoires]);

  const updatePreferences = React.useCallback(
    async (repertoireId: string, preferences: { favorite?: boolean; disabled?: boolean }) => {
      setUpdatingIds((current) => ({ ...current, [repertoireId]: true }));
      try {
        await updateRepertoirePreferences(repertoireId, preferences);
        await Promise.all([loadOverview(), updateRepertoires()]);
      } catch {
        showAlert("Unable to update repertoire preferences.", "error");
      } finally {
        setUpdatingIds((current) => {
          const next = { ...current };
          delete next[repertoireId];
          return next;
        });
      }
    },
    [loadOverview, showAlert, updateRepertoires]
  );

  const clearFilters = React.useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return (
    <PageRoot>
      <PageFrame className="h-full max-w-analytics py-4 sm:py-6">
        <PageSurface className="gap-4 border-none bg-transparent shadow-none">
          <PageHeader
            eyebrow={isMobile ? undefined : "Library"}
            title="Repertoires"
            description={
              isMobile
                ? undefined
                : "Manage your opening library, see due work at a glance, and jump into the next training action without leaving the page."
            }
            primaryAction={
              <Button
                intent="primary"
                size={isMobile ? "sm" : "md"}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set("create", "1");
                  setSearchParams(next, { replace: true });
                }}
              >
                Create repertoire
              </Button>
            }
            secondaryActions={!isMobile ? (
              <Button
                intent="secondary"
                size="md"
                onClick={() => {
                  clearFilters();
                }}
              >
                Reset filters
              </Button>
            ) : undefined}
            meta={!isMobile ? (
              <>
                <Badge variant="default" size="sm">
                  {activeSummary.repertoireCount} active repertoires
                </Badge>
                <Badge variant="info" size="sm">
                  {activeSummary.openingCount} openings
                </Badge>
                <Badge variant="warning" size="sm">
                  {activeSummary.dueVariantsCount} due variants
                </Badge>
                <Badge variant="danger" size="sm">
                  {activeSummary.dueMistakesCount} due mistakes
                </Badge>
              </>
            ) : undefined}
          />
          <RepertoireOverviewFilters
            query={query}
            orientation={orientation}
            status={openingStatus}
            availability={availability}
            favorites={favorites}
            mastery={mastery}
            onQueryChange={(value) => setFilter("q", value)}
            onOrientationChange={(value) => setFilter("orientation", value)}
            onStatusChange={(value) => setFilter("status", value)}
            onAvailabilityChange={(value) => setFilter("availability", value)}
            onFavoritesChange={(value) => setFilter("favorites", value)}
            onMasteryChange={(value) => setFilter("mastery", value)}
            onClearFilters={clearFilters}
          />
          {!isMobile ? (
            <StatStrip
              items={[
                {
                  label: "Active repertoires",
                  value: activeSummary.repertoireCount,
                  tone: "default",
                  detail: `${filteredRepertoires.length} shown in current scope`,
                },
                {
                  label: "Openings",
                  value: activeSummary.openingCount,
                  tone: "brand",
                  detail: "Across active filtered repertoires",
                },
                {
                  label: "Due variants",
                  value: activeSummary.dueVariantsCount,
                  tone: "warning",
                  detail: "Ready for review now",
                },
                {
                  label: "Due mistakes",
                  value: activeSummary.dueMistakesCount,
                  tone: "danger",
                  detail: "Need focused correction",
                },
              ]}
            />
          ) : null}
          <div className="flex-1 overflow-y-auto pb-6 pt-1">
            {status === "loading" ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 animate-pulse rounded-xl border border-border-subtle bg-surface-raised"
                  />
                ))}
              </div>
            ) : null}

            {status === "error" ? (
              <EmptyState
                title="Unable to load repertoire overview"
                description="Try again in a moment."
              />
            ) : null}

            {status === "success" && filteredRepertoires.length === 0 ? (
              <EmptyState
                title="No repertoires match your filters"
                description="Try a broader search or different filters."
              />
            ) : null}

            {status === "success" ? (
              <div className="space-y-4">
                {filteredRepertoires.map((repertoire) => (
                  <RepertoireOverviewGroup
                    key={repertoire.repertoireId}
                    repertoire={repertoire}
                    controlsDisabled={Boolean(updatingIds[repertoire.repertoireId])}
                    onViewRepertoire={() => navigate(getRepertoireEditorRoute(repertoire.repertoireId))}
                    onTrainRepertoire={() => navigate(getTrainRepertoireRoute(repertoire.repertoireId))}
                    onToggleFavorite={() =>
                      updatePreferences(repertoire.repertoireId, {
                        favorite: !repertoire.favorite,
                      })
                    }
                    onToggleDisabled={() =>
                      updatePreferences(repertoire.repertoireId, {
                        disabled: !repertoire.disabled,
                      })
                    }
                    onViewOpening={(openingName) =>
                      navigate(getRepertoireOpeningRoute(repertoire.repertoireId, openingName))
                    }
                    onEditOpening={(openingName) =>
                      navigate(
                        getRepertoireEditorRoute(repertoire.repertoireId, {
                          variantName: openingName,
                        })
                      )
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
          <CreateRepertoireDrawer
            open={createDrawerOpen}
            onClose={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("create");
              setSearchParams(next, { replace: true });
            }}
          />
        </PageSurface>
      </PageFrame>
    </PageRoot>
  );
};

export default RepertoiresPage;
