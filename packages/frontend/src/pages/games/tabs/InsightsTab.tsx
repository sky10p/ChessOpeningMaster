import React from "react";
import { GamesStatsSummary } from "@chess-opening-master/common";
import { formatPercent } from "../utils";
import { Card, SectionTitle } from "../components/InsightCard";
import { WDLBar, WDLMiniBar } from "../components/WDLBar";
import MonthChart from "../components/MonthChart";

type InsightsTabProps = {
  stats: GamesStatsSummary | null;
  mappedRatio: number;
  manualReviewRatio: number;
  wdl: { win: number; draw: number; loss: number };
  gamesByMonth: Array<{ month: string; games: number }>;
  maxMonthGames: number;
  variantPerformance: Array<{
    variantKey: string;
    variantName: string;
    repertoireId?: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    averageMappingConfidence?: number;
    successRate: number;
  }>;
  weakestVariants: Array<{ variantKey: string; variantName: string; repertoireId?: string; successRate: number }>;
  strongestVariants: Array<{ variantKey: string; variantName: string; repertoireId?: string; successRate: number }>;
  offBookOpenings: Array<{
    openingName: string;
    games: number;
    manualReviewGames: number;
    mappedGames: number;
    successRate: number;
    sampleLine: string[];
  }>;
  trainingIdeas: string[];
  openRepertoire: (repertoireId: string, variantName?: string) => void;
  openTrainRepertoire: (repertoireId: string, variantName?: string) => void;
};


const InsightsTab: React.FC<InsightsTabProps> = ({
  stats,
  mappedRatio,
  manualReviewRatio,
  wdl,
  gamesByMonth,
  maxMonthGames,
  variantPerformance,
  weakestVariants,
  strongestVariants,
  offBookOpenings,
  trainingIdeas,
  openRepertoire,
  openTrainRepertoire,
}) => (
  <>
    {/* ── Stat Cards ── */}
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {([
        { label: "Games",        value: stats?.totalGames ?? 0,       sub: null },
        { label: "Win Rate",     value: formatPercent(stats?.winRate ?? 0), sub: `${stats?.wins ?? 0}W · ${stats?.draws ?? 0}D · ${stats?.losses ?? 0}L` },
        { label: "Mapped",       value: formatPercent(mappedRatio),    sub: "to repertoire" },
        { label: "Off-Book",     value: formatPercent(manualReviewRatio), sub: "needs review" },
        { label: "Unique Lines", value: stats?.uniqueLines ?? 0,       sub: null },
      ] as const).map(({ label, value, sub }) => (
        <Card key={label}>
          <p className="text-[11px] text-text-subtle mb-1">{label}</p>
          <p className="text-2xl font-semibold text-text-base">{value}</p>
          {sub ? <p className="text-[11px] text-text-subtle mt-1">{sub}</p> : null}
        </Card>
      ))}
    </div>

    {/* ── Result Split ── */}
    <Card>
      <SectionTitle>Result Split</SectionTitle>
      <WDLBar win={wdl.win} draw={wdl.draw} loss={wdl.loss} />
    </Card>

    {/* ── Games by Month ── */}
    <Card>
      <SectionTitle>Games By Month</SectionTitle>
      <MonthChart gamesByMonth={gamesByMonth} maxMonthGames={maxMonthGames} />
    </Card>

    {/* ── Weakest & Strongest side by side ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Card>
        <SectionTitle>Weakest Variants</SectionTitle>
        {weakestVariants.length === 0
          ? <p className="text-sm text-text-subtle">Not enough data.</p>
          : weakestVariants.map((v) => (
              <div key={v.variantKey} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 gap-2">
                <p className="text-sm text-text-muted truncate">{v.variantName}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold text-rose-400 tabular-nums">{formatPercent(v.successRate)}</p>
                  {v.repertoireId ? (
                    <button className="text-xs px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => openTrainRepertoire(v.repertoireId as string, v.variantName)}>Train</button>
                  ) : null}
                </div>
              </div>
            ))
        }
      </Card>
      <Card>
        <SectionTitle>Strongest Variants</SectionTitle>
        {strongestVariants.length === 0
          ? <p className="text-sm text-text-subtle">Not enough data.</p>
          : strongestVariants.map((v) => (
              <div key={v.variantKey} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 gap-2">
                <p className="text-sm text-text-muted truncate">{v.variantName}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold text-emerald-400 tabular-nums">{formatPercent(v.successRate)}</p>
                  {v.repertoireId ? (
                    <button className="text-xs px-2 py-0.5 rounded-md bg-surface-raised hover:bg-slate-700 text-text-muted border border-border-default transition-colors" onClick={() => openRepertoire(v.repertoireId as string, v.variantName)}>View</button>
                  ) : null}
                </div>
              </div>
            ))
        }
      </Card>
    </div>

    {/* ── Off-Book Openings & Training Ideas ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Card>
        <SectionTitle>Off-Book Openings</SectionTitle>
        {offBookOpenings.length === 0
          ? <p className="text-sm text-text-subtle">None detected.</p>
          : offBookOpenings.map((o) => (
              <div key={`${o.openingName}-${o.games}`} className="py-2.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-text-muted truncate">{o.openingName}</p>
                  <p className="text-xs text-text-subtle shrink-0 tabular-nums">{o.games}g · {formatPercent(o.successRate)}</p>
                </div>
                <p className="mt-0.5 text-[11px] font-mono text-slate-600 truncate">{o.sampleLine.slice(0, 6).join(" ")}</p>
              </div>
            ))
        }
      </Card>
      <Card>
        <SectionTitle>Training Ideas</SectionTitle>
        {trainingIdeas.length === 0
          ? <p className="text-sm text-text-subtle">No ideas yet.</p>
          : <ul className="space-y-2.5">
              {trainingIdeas.map((idea) => (
                <li key={idea} className="flex items-start gap-2 text-sm text-text-muted leading-snug">
                  <span className="text-blue-400 shrink-0 select-none mt-0.5">›</span>
                  {idea}
                </li>
              ))}
            </ul>
        }
      </Card>
    </div>

    {/* ── Performance By Variant (last) ── */}
    <Card>
      <SectionTitle>Performance By Variant</SectionTitle>
      {variantPerformance.length === 0
        ? <p className="text-sm text-text-subtle">No variant data for current filters.</p>
        : <div className="space-y-4">
            {variantPerformance.slice(0, 8).map((v) => (
              <div key={v.variantKey}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm text-text-muted truncate">{v.variantName}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-text-subtle tabular-nums">{v.games}g</span>
                    <span className="text-sm font-semibold tabular-nums text-text-base">{formatPercent(v.successRate)}</span>
                    {v.repertoireId ? (
                      <>
                        <button className="text-xs px-2 py-0.5 rounded-md bg-surface-raised hover:bg-slate-700 text-text-muted border border-border-default transition-colors" onClick={() => openRepertoire(v.repertoireId as string, v.variantName)}>View</button>
                        <button className="text-xs px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => openTrainRepertoire(v.repertoireId as string, v.variantName)}>Train</button>
                      </>
                    ) : null}
                  </div>
                </div>
                <WDLMiniBar wins={v.wins} draws={v.draws} losses={v.losses} />
                <div className="mt-1 flex gap-3 text-[11px] text-slate-600 tabular-nums">
                  <span className="text-emerald-600">{v.wins}W</span>
                  <span>{v.draws}D</span>
                  <span className="text-rose-600">{v.losses}L</span>
                  {typeof v.averageMappingConfidence === "number" ? <span>Map {formatPercent(v.averageMappingConfidence)}</span> : null}
                </div>
              </div>
            ))}
          </div>
      }
    </Card>
  </>
);

export default InsightsTab;
