import React from "react";
import { ImportedGame } from "@chess-opening-master/common";
import { buildLineTitle, formatDateTime, formatPercent, getOpeningLabel } from "../utils";

type DataTabProps = {
  games: ImportedGame[];
  gamesByMonthGroups: Array<[string, ImportedGame[]]>;
  clearFiltered: () => Promise<void>;
  clearAll: () => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  openRepertoire: (repertoireId: string, variantName?: string) => void;
  openTrainRepertoire: (repertoireId: string, variantName?: string) => void;
};

const resultColor = (result: string) => {
  if (result === "1-0") return "text-emerald-400";
  if (result === "0-1") return "text-rose-400";
  return "text-text-subtle";
};

const DataTab: React.FC<DataTabProps> = ({
  games,
  gamesByMonthGroups,
  clearFiltered,
  clearAll,
  removeGame,
  openRepertoire,
  openTrainRepertoire,
}) => (
  <div className="space-y-4">
    <div className="bg-surface rounded-xl border border-border-subtle p-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-text-muted">
        <span className="font-semibold text-text-base">{games.length}</span>
        <span className="text-text-subtle"> games in current view</span>
      </p>
      <div className="flex gap-2">
        <button
          className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-rose-900/60 text-rose-400 text-xs border border-border-default hover:border-rose-800 transition-colors"
          onClick={() => { void clearFiltered(); }}
        >
          Delete filtered
        </button>
        <button
          className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-rose-900/60 text-rose-400 text-xs border border-border-default hover:border-rose-800 transition-colors"
          onClick={() => { void clearAll(); }}
        >
          Delete all
        </button>
      </div>
    </div>

    {gamesByMonthGroups.map(([month, monthGames]) => (
      <div key={month} className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle px-4 pt-3 pb-2 border-b border-border-subtle">{month}</p>
        <div className="divide-y divide-slate-800">
          {monthGames.map((game) => {
            const opening = getOpeningLabel(game);
            return (
              <div key={game.id} className="px-4 py-3 hover:bg-surface-raised/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-base truncate">{opening}{game.openingDetection.eco ? ` (${game.openingDetection.eco})` : ""}</span>
                      <span className={`text-xs font-semibold ${resultColor(game.result)}`}>{game.result}</span>
                    </div>
                    <p className="text-xs text-text-subtle">
                      {formatDateTime(game.playedAt)} · {game.white} vs {game.black} · {game.timeControlBucket || "?"}  · {game.source}
                    </p>
                    {game.openingMapping.variantName ? (
                      <p className="text-xs text-text-subtle">
                        {buildLineTitle(opening, game.openingMapping.variantName, game.openingMapping.repertoireName)}
                        {" · "}{formatPercent(game.openingMapping.confidence)} conf.
                        {game.openingMapping.requiresManualReview ? <span className="text-amber-400"> · needs review</span> : null}
                      </p>
                    ) : null}
                    <p className="text-xs font-mono text-slate-600 truncate">{game.movesSan.slice(0, 12).join(" ")}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {game.openingMapping.repertoireId ? (
                      <>
                        <button className="text-xs px-2.5 py-1 rounded-md bg-surface-raised hover:bg-slate-700 text-text-muted border border-border-default transition-colors" onClick={() => openRepertoire(game.openingMapping.repertoireId as string, game.openingMapping.variantName || opening)}>View</button>
                        <button className="text-xs px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => openTrainRepertoire(game.openingMapping.repertoireId as string, game.openingMapping.variantName || opening)}>Train</button>
                      </>
                    ) : null}
                    <button className="text-xs px-2.5 py-1 rounded-md bg-surface-raised hover:bg-rose-900/60 text-rose-400 border border-border-default hover:border-rose-800 transition-colors" onClick={() => { void removeGame(game.id); }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

export default DataTab;
