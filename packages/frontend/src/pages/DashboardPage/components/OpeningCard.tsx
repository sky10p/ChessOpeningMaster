import React, { useMemo, useState } from "react";
import { EyeIcon, PlayIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";
import { OpeningRepertoiresList } from "./OpeningRepertoiresList";
import { StaticChessboard } from "../../../components/design/chess/StaticChessboard";
import { getOpeningFen } from "../../../utils/getOpeningFen";
import { Button, Badge } from "../../../components/ui";
import { cn } from "../../../utils/cn";

const FALLBACK_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

interface OpeningCardProps {
  opening: string;
  repertoiresWithOpening: IRepertoireDashboard[];
  summaryVariants: TrainVariant[];
  summaryVariantInfo: Record<string, TrainVariantInfo>;
  isOpen: boolean;
  repCount: number;
  onToggle: () => void;
  goToRepertoire: (repertoire: IRepertoireDashboard, variantName?: string) => void;
  goToTrainRepertoire: (repertoire: IRepertoireDashboard, variantName?: string) => void;
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
}

export const OpeningCard: React.FC<OpeningCardProps> = ({
  opening,
  repertoiresWithOpening,
  summaryVariants,
  summaryVariantInfo,
  isOpen,
  repCount,
  onToggle,
  goToRepertoire,
  goToTrainRepertoire,
  getTrainVariantInfo,
}) => {
  const primaryRepertoire = repertoiresWithOpening[0];
  const orientation = primaryRepertoire?.orientation ?? "white";
  const isSingle = repertoiresWithOpening.length === 1;
  const [isPeeking, setIsPeeking] = useState(false);

  const fen = useMemo(
    () =>
      primaryRepertoire
        ? getOpeningFen(primaryRepertoire.moveNodes, opening)
        : FALLBACK_FEN,
    [primaryRepertoire, opening]
  );

  const isMastered = useMemo(() => {
    if (summaryVariants.length === 0) return false;
    return summaryVariants.every((v) => {
      const info = summaryVariantInfo[v.variant.fullName];
      return info !== undefined && info.errors === 0;
    });
  }, [summaryVariants, summaryVariantInfo]);

  return (
    <div
      className={cn(
        "rounded-xl border border-border-default shadow-surface overflow-hidden",
        "hover:shadow-elevated transition-shadow duration-200 flex flex-col",
        "focus-within:ring-2 focus-within:ring-brand"
      )}
    >
      {/* ── Board fills card, content overlays it ── */}
      <div className="relative">
        {/* Board — determines card width/height ratio */}
        <StaticChessboard fen={fen} orientation={orientation} />

        {/* Peek zone: top 55% — press-and-hold to reveal board; scroll gestures pass through */}
        <div
          className="absolute inset-0 z-10 cursor-zoom-in"
          onPointerDown={() => setIsPeeking(true)}
          onPointerUp={() => setIsPeeking(false)}
          onPointerLeave={() => setIsPeeking(false)}
          onPointerCancel={() => setIsPeeking(false)}
        />

        {/* Gradient: always dark regardless of page theme — fades on peek */}
        <div
          className={cn(
            "absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none transition-opacity duration-200",
            isPeeking && "opacity-0"
          )}
        />

        {/* ── TOP: badges ── */}
        <div
          className={cn(
            "absolute top-2 left-2 right-2 z-30 flex items-start justify-between gap-1 transition-opacity duration-200 pointer-events-none",
            isPeeking && "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex gap-1 flex-wrap">
            <Badge
              size="sm"
              variant={orientation === "white" ? "default" : "brand"}
              className={
                orientation === "white"
                  ? "bg-white text-neutral-900 border-white/80 font-bold shadow"
                  : "bg-neutral-900 text-white border-neutral-700 font-bold shadow"
              }
            >
              {orientation === "white" ? "WHITE" : "BLACK"}
            </Badge>
            {isMastered && (
              <Badge
                size="sm"
                variant="success"
                className="bg-emerald-500 text-white border-emerald-400 font-bold shadow"
              >
                Mastered
              </Badge>
            )}
          </div>
          {!isSingle && (
            <Badge
              size="sm"
              variant="info"
              className="bg-sky-500 text-white border-sky-400 font-bold shadow flex-shrink-0"
            >
              {repCount}×
            </Badge>
          )}
        </div>

        {/* ── BOTTOM: title, meta, progress, actions ── */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-30 px-2.5 pt-8 pb-2.5 flex flex-col gap-1.5 transition-opacity duration-200 pointer-events-none",
            isPeeking && "opacity-0 pointer-events-none"
          )}
        >
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-md">
            {opening}
          </h3>
          <p className="text-[11px] text-white/70 truncate leading-none">
            {isSingle
              ? (primaryRepertoire?.name ?? "No repertoire")
              : `${repCount} repertoires`}
            {" · "}
            {summaryVariants.length} {summaryVariants.length === 1 ? "line" : "lines"}
          </p>

          <VariantsProgressBar
            variants={summaryVariants}
            variantInfo={summaryVariantInfo}
          />

          <div className="flex gap-1.5 mt-0.5 pointer-events-auto">
            <Button
              intent="primary"
              size="sm"
              onClick={() => primaryRepertoire && goToTrainRepertoire(primaryRepertoire, opening)}
              disabled={!primaryRepertoire}
              className="flex-1 justify-center"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Train
            </Button>
            {isSingle ? (
              <Button
                intent="ghost"
                size="sm"
                onClick={() => primaryRepertoire && goToRepertoire(primaryRepertoire, opening)}
                aria-label="View repertoire"
                className="text-white/80 hover:text-white hover:bg-white/15 border border-white/25 hover:border-white/50"
              >
                <EyeIcon className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                intent="ghost"
                size="sm"
                onClick={onToggle}
                aria-label={isOpen ? "Collapse" : "Expand"}
                className="text-white/80 hover:text-white hover:bg-white/15 border border-white/25 hover:border-white/50"
              >
                {isOpen ? (
                  <ChevronUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded repertoires list (outside the board overlay) ── */}
      {!isSingle && isOpen && (
        <div className="border-t border-border-subtle bg-surface">
          <OpeningRepertoiresList
            opening={opening}
            repertoiresWithOpening={repertoiresWithOpening}
            getTrainVariantInfo={getTrainVariantInfo}
            goToRepertoire={(repertoire) => goToRepertoire(repertoire, opening)}
            goToTrainRepertoire={(repertoire) =>
              goToTrainRepertoire(repertoire, opening)
            }
          />
        </div>
      )}
    </div>
  );
};
