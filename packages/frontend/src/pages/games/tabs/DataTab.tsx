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

const DataTab: React.FC<DataTabProps> = ({
  games,
  gamesByMonthGroups,
  clearFiltered,
  clearAll,
  removeGame,
  openRepertoire,
  openTrainRepertoire,
}) => (
  <>
    <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">Manage Imported Data</h2>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-300">{games.length} games in current filters</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-rose-700 text-sm" onClick={() => { void clearFiltered(); }}>Delete filtered games</button>
          <button className="px-3 py-2 rounded bg-rose-900 text-sm" onClick={() => { void clearAll(); }}>Delete all games</button>
        </div>
      </div>
    </section>
    <section className="space-y-3">
      {gamesByMonthGroups.map(([month, monthGames]) => (
        <div key={month} className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-100">{month}</p>
          {monthGames.map((game) => (
            <div key={game.id} className="bg-slate-800/90 rounded p-3 space-y-1 break-words">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium text-slate-100 break-words">
                  {formatDateTime(game.playedAt)} | {game.source} | {game.orientation || "?"} | {game.timeControlBucket || "unknown speed"} | {game.white} vs {game.black} | {game.result}
                </p>
                <div className="flex gap-2">
                  {game.openingMapping.repertoireId ? (
                    <>
                      <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(game.openingMapping.repertoireId as string, game.openingMapping.variantName || getOpeningLabel(game))}>See</button>
                      <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(game.openingMapping.repertoireId as string, game.openingMapping.variantName || getOpeningLabel(game))}>Train</button>
                    </>
                  ) : null}
                  <button className="text-xs px-2 py-1 rounded bg-rose-700" onClick={() => { void removeGame(game.id); }}>Delete</button>
                </div>
              </div>
              <p className="text-sm text-slate-200">{getOpeningLabel(game)}{game.openingDetection.eco ? ` (${game.openingDetection.eco})` : ""}</p>
              <p className="text-xs text-slate-400">
                Mapping: {buildLineTitle(getOpeningLabel(game), game.openingMapping.variantName, game.openingMapping.repertoireName)} | Confidence {formatPercent(game.openingMapping.confidence)} | {game.openingMapping.strategy}{game.openingMapping.requiresManualReview ? " | needs review" : ""}
              </p>
              <p className="text-sm text-slate-300">{game.movesSan.slice(0, 16).join(" ")}</p>
            </div>
          ))}
        </div>
      ))}
    </section>
  </>
);

export default DataTab;
