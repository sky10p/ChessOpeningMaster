import React from "react";
import { GamesStatsSummary } from "@chess-opening-master/common";
import { formatPercent, outcomePercentages } from "../utils";

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
    successRate: number;
  }>;
  weakestVariants: Array<{ variantKey: string; variantName: string; successRate: number }>;
  strongestVariants: Array<{ variantKey: string; variantName: string; successRate: number }>;
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
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Imported Games</p><p className="text-xl font-semibold text-slate-100">{stats?.totalGames || 0}</p></div>
      <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Win Rate</p><p className="text-xl font-semibold text-slate-100">{formatPercent(stats?.winRate || 0)}</p><p className="text-xs text-slate-400">W {stats?.wins || 0} D {stats?.draws || 0} L {stats?.losses || 0}</p></div>
      <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Mapped To Repertoire</p><p className="text-xl font-semibold text-slate-100">{formatPercent(mappedRatio)}</p></div>
      <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Off-Book Pressure</p><p className="text-xl font-semibold text-slate-100">{formatPercent(manualReviewRatio)}</p></div>
      <div className="bg-slate-900/80 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">Unique Lines</p><p className="text-xl font-semibold text-slate-100">{stats?.uniqueLines || 0}</p></div>
    </section>

    <section className="bg-slate-900 rounded-lg border border-slate-700 p-4 space-y-2">
      <h2 className="text-lg font-semibold text-slate-100">Overall Outcome Ratio</h2>
      <div className="h-3 bg-slate-700 rounded overflow-hidden flex">
        <div className="bg-emerald-500" style={{ width: `${(wdl.win * 100).toFixed(2)}%` }} />
        <div className="bg-slate-400" style={{ width: `${(wdl.draw * 100).toFixed(2)}%` }} />
        <div className="bg-rose-500" style={{ width: `${(wdl.loss * 100).toFixed(2)}%` }} />
      </div>
      <p className="text-xs text-slate-300">Win {formatPercent(wdl.win)} | Draw {formatPercent(wdl.draw)} | Loss {formatPercent(wdl.loss)}</p>
    </section>

    <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">Games By Date</h2>
      <p className="text-xs text-slate-400">Monthly game volume for the current filters.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-10 gap-2 items-end min-h-[120px] sm:min-h-[140px]">
        {gamesByMonth.map((month) => (
          <div key={month.month} className="space-y-1">
            <div className="h-24 bg-slate-800 rounded flex items-end">
              <div className="w-full bg-blue-500 rounded" style={{ height: `${maxMonthGames > 0 ? Math.max(6, (month.games / maxMonthGames) * 100) : 6}%` }} />
            </div>
            <p className="text-[11px] text-slate-300">{month.month}</p>
            <p className="text-[11px] text-slate-400">{month.games}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
      <h2 className="text-lg font-semibold text-slate-100">Success / Draw / Loss By Opening Variant</h2>
      {(variantPerformance.length === 0) ? <p className="text-sm text-slate-400">No variant data for current filters.</p> : null}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {variantPerformance.slice(0, 8).map((variant) => {
          const percentages = outcomePercentages(variant.wins, variant.draws, variant.losses);
          return (
            <div key={variant.variantKey} className="bg-slate-800/90 rounded p-2 sm:p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-100 truncate">{variant.variantName}</p>
                <p className="text-xs sm:text-sm text-slate-200">{formatPercent(variant.successRate)}</p>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">G {variant.games} | W {variant.wins} D {variant.draws} L {variant.losses}</p>
              <div className="mt-1.5 h-1.5 bg-slate-700 rounded overflow-hidden flex">
                <div className="bg-emerald-500" style={{ width: `${(percentages.win * 100).toFixed(2)}%` }} />
                <div className="bg-slate-400" style={{ width: `${(percentages.draw * 100).toFixed(2)}%` }} />
                <div className="bg-rose-500" style={{ width: `${(percentages.loss * 100).toFixed(2)}%` }} />
              </div>
              {variant.repertoireId ? (
                <div className="mt-1.5 hidden sm:flex gap-2">
                  <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(variant.repertoireId as string, variant.variantName)}>See</button>
                  <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(variant.repertoireId as string, variant.variantName)}>Train</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>

    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
        <h2 className="text-lg font-semibold text-slate-100">Weakest Variants</h2>
        {weakestVariants.map((variant) => (
          <div key={`weak-${variant.variantKey}`} className="bg-slate-800/90 rounded p-3 flex items-center justify-between gap-2">
            <p className="text-sm text-slate-100">{variant.variantName}</p>
            <p className="text-sm text-rose-300">{formatPercent(variant.successRate)}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
        <h2 className="text-lg font-semibold text-slate-100">Strongest Variants</h2>
        {strongestVariants.map((variant) => (
          <div key={`strong-${variant.variantKey}`} className="bg-slate-800/90 rounded p-3 flex items-center justify-between gap-2">
            <p className="text-sm text-slate-100">{variant.variantName}</p>
            <p className="text-sm text-emerald-300">{formatPercent(variant.successRate)}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
        <h2 className="text-lg font-semibold text-slate-100">Off-Book And Unknown Openings</h2>
        {offBookOpenings.map((opening) => (
          <div key={`${opening.openingName}-${opening.games}`} className="bg-slate-800/90 rounded p-3">
            <p className="text-sm font-medium text-slate-100">{opening.openingName}</p>
            <p className="text-xs text-slate-400">Manual review {opening.manualReviewGames}/{opening.games} | Mapped {opening.mappedGames}/{opening.games} | Success {formatPercent(opening.successRate)}</p>
            <p className="text-xs text-slate-300">Line sample: {opening.sampleLine.join(" ")}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
        <h2 className="text-lg font-semibold text-slate-100">Training Ideas</h2>
        <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
          {trainingIdeas.map((idea) => <li key={idea}>{idea}</li>)}
        </ul>
      </div>
    </section>
  </>
);

export default InsightsTab;
