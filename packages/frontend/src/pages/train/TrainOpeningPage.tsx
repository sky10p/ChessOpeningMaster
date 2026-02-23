import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TrainOpeningResponse } from "@chess-opening-master/common";
import { Badge, Button, Card } from "../../components/ui";
import { getTrainOpening } from "../../repository/train/train";
import { StaticChessboard } from "../../components/design/chess/StaticChessboard";
import { TrainOpeningActions } from "./components/TrainOpeningActions";
import { TrainOpeningMistakeSummary } from "./components/TrainOpeningMistakeSummary";
import { TrainOpeningVariantList } from "./components/TrainOpeningVariantList";

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

const TrainOpeningPage: React.FC = () => {
  const navigate = useNavigate();
  const { repertoireId = "", openingName = "" } = useParams();
  const decodedOpeningName = useMemo(
    () => decodeURIComponent(openingName || ""),
    [openingName]
  );
  const [payload, setPayload] = useState<TrainOpeningResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setStatus("loading");
        const response = await getTrainOpening(repertoireId, decodedOpeningName);
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
    if (repertoireId && decodedOpeningName) {
      void load();
    }
    return () => {
      ignore = true;
    };
  }, [decodedOpeningName, repertoireId]);

  const allMistakeVariantNames = useMemo(() => {
    const names = new Set<string>();
    (payload?.mistakes || []).forEach((mistake) => {
      names.add(mistake.variantName);
    });
    return Array.from(names.values()).sort();
  }, [payload?.mistakes]);

  const navigateToTrain = (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        query.set(key, value);
      }
    });
    navigate(
      `/repertoire/train/${repertoireId}${query.toString() ? `?${query.toString()}` : ""}`
    );
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

  const handleReviewDueMistakes = () => {
    if (!payload) {
      return;
    }
    navigateToTrain({
      mode: "mistakes",
      openingName: payload.openingName,
      variantNames: allMistakeVariantNames.join("|"),
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

  if (status === "loading") {
    return (
      <div className="w-full h-full overflow-y-auto bg-page text-text-base">
        <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
          <Card className="h-32 animate-pulse border-border-subtle bg-surface-raised" />
        </div>
      </div>
    );
  }

  if (status === "error" || !payload) {
    return (
      <div className="w-full h-full overflow-y-auto bg-page text-text-base">
        <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
          <Card className="border-border-default bg-surface" padding="default">
            <p className="text-sm text-text-muted">Unable to load opening training details.</p>
            <div className="mt-3">
              <Button intent="secondary" size="sm" onClick={() => navigate("/train")}>
                Back to Train
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const mastery = getMasteryBadge(payload.stats.masteryScore);

  return (
    <div className="w-full h-full overflow-y-auto bg-page text-text-base">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-3">
          <Button intent="ghost" size="sm" onClick={() => navigate("/train")}>
            Back
          </Button>
        </div>
        <Card className="mb-4 border-border-default bg-surface" padding="default">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-raised">
              <StaticChessboard
                fen={payload.openingFen || FALLBACK_FEN}
                orientation={payload.orientation || "white"}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-subtle">
                    {payload.repertoireName}
                  </p>
                  <h1 className="text-2xl font-semibold leading-tight text-text-base">
                    {payload.openingName}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={mastery.variant} size="sm">
                    {mastery.label}
                  </Badge>
                  <Badge variant="brand" size="sm">
                    Mastery {payload.stats.masteryScore}%
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Due Variants</div>
                  <div className="text-sm font-semibold text-text-base">
                    {payload.stats.dueVariantsCount}
                  </div>
                </div>
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Due Mistakes</div>
                  <div className="text-sm font-semibold text-text-base">
                    {payload.stats.dueMistakesCount}
                  </div>
                </div>
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Variants</div>
                  <div className="text-sm font-semibold text-text-base">
                    {payload.stats.totalVariantsCount}
                  </div>
                </div>
                <div className="rounded-md border border-border-subtle bg-surface-raised px-3 py-2">
                  <div className="text-xs text-text-subtle">Mistakes Reduced (7d)</div>
                  <div className="text-sm font-semibold text-text-base">
                    {payload.stats.mistakesReducedLast7Days}
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Due variants are scheduled for review now and not already reviewed today. Non-due variants are scheduled for a future date.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <TrainOpeningActions
              totalVariantsCount={payload.variants.length}
              onStartNormalMode={handleStartNormalMode}
            />
            <TrainOpeningVariantList
              variants={payload.variants}
              onTrainVariantNormal={handleTrainVariantNormal}
              onTrainVariantFocus={handleTrainVariantFocus}
            />
          </div>
          <TrainOpeningMistakeSummary
            mistakes={payload.mistakes}
            onReviewDueMistakes={handleReviewDueMistakes}
            onTrainSpecificMistake={(mistake) =>
              handleTrainSpecificMistake(mistake.mistakeKey, mistake.variantName)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TrainOpeningPage;
