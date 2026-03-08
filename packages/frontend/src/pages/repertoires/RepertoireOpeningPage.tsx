import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TrainOpeningResponse } from "@chess-opening-master/common";
import { Badge, Button, Card, EmptyState, MasteryBadge, PageHeader, SectionHeader, StatStrip } from "../../components/ui";
import { StaticChessboard } from "../../components/design/chess/StaticChessboard";
import { PageFrame } from "../../components/design/layouts/PageFrame";
import { PageRoot } from "../../components/design/layouts/PageRoot";
import { useIsMobile } from "../../hooks/useIsMobile";
import { getTrainOpening } from "../../repository/train/train";
import { useNavigationUtils } from "../../utils/navigationUtils";
import { START_FEN } from "../../utils/getOpeningFen";
import {
  buildTrainExecutionSearch,
  getRepertoiresRoute,
  getTrainRepertoireRoute,
} from "../../utils/appRoutes";
import { TrainOpeningMistakeSummary } from "../train/components/TrainOpeningMistakeSummary";
import { TrainOpeningVariantList } from "../train/components/TrainOpeningVariantList";
import { getDueTrainMistakes } from "../train/mistakeUtils";

const RepertoireOpeningPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { goToRepertoire } = useNavigationUtils();
  const { repertoireId = "", openingName = "" } = useParams();
  const isMobile = useIsMobile();
  const [payload, setPayload] = useState<TrainOpeningResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const backTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get("returnTo");
    if (!returnTo || !returnTo.startsWith("/")) {
      return getRepertoiresRoute();
    }
    return returnTo;
  }, [location.search]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setStatus("loading");
        const response = await getTrainOpening(repertoireId, openingName);
        if (!ignore) {
          setPayload(response);
          setStatus("success");
        }
      } catch {
        if (!ignore) {
          setStatus("error");
        }
      }
    };
    if (repertoireId && openingName) {
      void load();
    }
    return () => {
      ignore = true;
    };
  }, [openingName, repertoireId]);

  const navigateToTrain = (params: Record<string, string | undefined>) => {
    navigate(getTrainRepertoireRoute(repertoireId, buildTrainExecutionSearch(params)));
  };

  const handleStartNormalMode = () => {
    if (!payload || payload.variants.length === 0) {
      return;
    }
    navigateToTrain({
      mode: "standard",
      openingName: payload.openingName,
      variantNames: payload.variants.map((variant) => variant.variantName).join("|"),
    });
  };

  const handleTrainSpecificMistake = (mistakeKey: string, variantName: string) => {
    if (!payload) {
      return;
    }
    navigateToTrain({
      mode: "mistakes",
      openingName: payload.openingName,
      variantName,
      mistakeKey,
    });
  };

  const handleTrainVariantNormal = (variantName: string) => {
    if (!payload) {
      return;
    }
    navigateToTrain({
      mode: "standard",
      openingName: payload.openingName,
      variantName,
    });
  };

  const handleTrainVariantFocus = (variantName: string) => {
    if (!payload) {
      return;
    }
    navigateToTrain({
      mode: "mistakes",
      openingName: payload.openingName,
      variantName,
    });
  };

  const handleViewOpening = () => {
    if (!payload) {
      return;
    }
    goToRepertoire(repertoireId, payload.openingName);
  };

  const handleViewVariant = (variantName: string) => {
    goToRepertoire(repertoireId, variantName);
  };

  if (status === "loading") {
    return (
      <PageRoot>
        <PageFrame className="max-w-analytics py-4 sm:py-6">
          <div className="space-y-4">
            <Card className="h-36 animate-pulse border-border-subtle bg-surface-raised" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-28 animate-pulse border-border-subtle bg-surface-raised" />
              ))}
            </div>
          </div>
        </PageFrame>
      </PageRoot>
    );
  }

  if (status === "error" || !payload) {
    return (
      <PageRoot>
        <PageFrame className="max-w-analytics py-4 sm:py-6">
          <EmptyState
            title="Unable to load opening details"
            description="The opening hub could not be loaded right now."
            action={
              <Button intent="secondary" size="md" onClick={() => navigate(backTarget)}>
                Back
              </Button>
            }
          />
        </PageFrame>
      </PageRoot>
    );
  }

  const dueMistakes = getDueTrainMistakes(payload.mistakes);
  const hasVariants = payload.variants.length > 0;
  const metaBadges = (
    <>
      <MasteryBadge score={payload.stats.masteryScore} size="sm">
        Mastery {payload.stats.masteryScore}%
      </MasteryBadge>
      <Badge variant="brand" size="sm">
        {payload.orientation === "black" ? "Black repertoire" : "White repertoire"}
      </Badge>
      <Badge variant="warning" size="sm">
        {payload.stats.dueVariantsCount} due variants
      </Badge>
      <Badge variant="danger" size="sm">
        {payload.stats.dueMistakesCount} due mistakes
      </Badge>
    </>
  );
  const mobileSummaryBadges = (
    <>
      <Badge variant="info" size="sm">
        {payload.orientation === "black" ? "Black repertoire" : "White repertoire"}
      </Badge>
      <Badge variant="warning" size="sm">
        {payload.stats.dueVariantsCount} due variants
      </Badge>
      <Badge variant="danger" size="sm">
        {payload.stats.dueMistakesCount} due mistakes
      </Badge>
    </>
  );
  const statItems = [
    {
      label: "Due variants",
      value: payload.stats.dueVariantsCount,
      tone: "warning" as const,
      detail: "Ready for normal review now",
    },
    {
      label: "Due mistakes",
      value: payload.stats.dueMistakesCount,
      tone: "danger" as const,
      detail: `${dueMistakes.length} ready for reinforcement`,
    },
    {
      label: "Variants",
      value: payload.stats.totalVariantsCount,
      tone: "brand" as const,
      detail: "Available inside this opening",
    },
    {
      label: "Mistakes reduced (7d)",
      value: payload.stats.mistakesReducedLast7Days,
      tone: "success" as const,
      detail: "Recent reinforcement progress",
    },
  ];

  const handleReviewDueMistakes = () => {
    const mistakeKeys = dueMistakes
      .map((mistake) => mistake.mistakeKey)
      .filter(Boolean)
      .join("|");
    if (!mistakeKeys) {
      return;
    }
    navigateToTrain({
      mode: "mistakes",
      openingName: payload.openingName,
      mistakeKeys,
    });
  };

  return (
    <PageRoot>
      <PageFrame className="max-w-analytics py-4 sm:py-6">
        <div className="space-y-4">
          {isMobile ? (
            <>
              <div className="flex items-center">
                <Button intent="ghost" size="sm" onClick={() => navigate(backTarget)}>
                  Back
                </Button>
              </div>

              <Card
                className="border-border-default bg-surface"
                padding="relaxed"
                elevation="raised"
                role="region"
                aria-labelledby="opening-hero-title"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                      {payload.repertoireName}
                    </p>
                    <h1
                      id="opening-hero-title"
                      className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-text-base"
                    >
                      {payload.openingName}
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {mobileSummaryBadges}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
                    <StaticChessboard
                      fen={payload.openingFen || START_FEN}
                      orientation={payload.orientation || "white"}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Button
                      intent="primary"
                      size="lg"
                      onClick={handleStartNormalMode}
                      disabled={!hasVariants}
                      className="w-full justify-center"
                    >
                      Start review
                    </Button>
                    <Button
                      intent="secondary"
                      size="md"
                      onClick={handleViewOpening}
                      className="w-full justify-center"
                    >
                      Open editor
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <PageHeader
              eyebrow={payload.repertoireName}
              title={payload.openingName}
              description="Review the full opening, inspect individual lines, or switch into mistake reinforcement without leaving the repertoire workflow."
              primaryAction={
                <Button intent="primary" size="md" onClick={handleStartNormalMode} disabled={!hasVariants}>
                  Start review
                </Button>
              }
              secondaryActions={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button intent="ghost" size="md" onClick={() => navigate(backTarget)}>
                    Back
                  </Button>
                  <Button intent="secondary" size="md" onClick={handleViewOpening}>
                    Open editor
                  </Button>
                </div>
              }
              meta={metaBadges}
            />
          )}

          {!isMobile ? (
            <StatStrip
              items={statItems}
            />
          ) : null}

          {isMobile ? (
            <div className="space-y-4">
              <TrainOpeningVariantList
                variants={payload.variants}
                onViewVariant={handleViewVariant}
                onTrainVariantNormal={handleTrainVariantNormal}
                onTrainVariantFocus={handleTrainVariantFocus}
                compact
              />

              <TrainOpeningMistakeSummary
                mistakes={payload.mistakes}
                onReviewDueMistakes={handleReviewDueMistakes}
                onTrainSpecificMistake={(mistake) =>
                  handleTrainSpecificMistake(mistake.mistakeKey, mistake.variantName)
                }
                compact
                visibleLimit={4}
              />
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,1fr)]">
              <div className="space-y-4">
                <Card className="border-border-default bg-surface" padding="relaxed">
                  <div className="grid gap-5 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
                      <StaticChessboard
                        fen={payload.openingFen || START_FEN}
                        orientation={payload.orientation || "white"}
                      />
                    </div>
                    <div className="space-y-4">
                      <SectionHeader
                        title="Opening snapshot"
                        description="Use the board preview to confirm position context before jumping into review or line-level practice."
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">What matters now</p>
                          <p className="mt-2 text-sm leading-6 text-text-muted">
                            Prioritize due variants first, then use mistake reinforcement when one tactical branch keeps failing.
                          </p>
                        </div>
                        <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Review rule</p>
                          <p className="mt-2 text-sm leading-6 text-text-muted">
                            Due variants are ready now and not already completed today. Future variants stay de-emphasized until scheduled.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <TrainOpeningVariantList
                  variants={payload.variants}
                  onViewVariant={handleViewVariant}
                  onTrainVariantNormal={handleTrainVariantNormal}
                  onTrainVariantFocus={handleTrainVariantFocus}
                />
              </div>

              <div className="space-y-4">
                <TrainOpeningMistakeSummary
                  mistakes={payload.mistakes}
                  onReviewDueMistakes={handleReviewDueMistakes}
                  onTrainSpecificMistake={(mistake) =>
                    handleTrainSpecificMistake(mistake.mistakeKey, mistake.variantName)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </PageFrame>
    </PageRoot>
  );
};

export default RepertoireOpeningPage;
