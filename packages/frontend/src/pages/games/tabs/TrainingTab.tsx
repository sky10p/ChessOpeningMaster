import React from "react";
import { LineStudyCandidate, TrainingPlanItem } from "@chess-opening-master/common";
import { buildLineTitle, formatDateTime, formatPercent } from "../utils";

type TrainingTabProps = {
  trainingPlanId?: string;
  actionableTrainingItems: TrainingPlanItem[];
  signalLines: LineStudyCandidate[];
  trainingItemsWithErrors: number;
  highPriorityTrainingItems: number;
  offBookSignalCount: number;
  openingTargetFromLine: (lineKey: string) => { repertoireId: string; variantName: string } | null;
  openRepertoire: (repertoireId: string, variantName?: string) => void;
  openTrainRepertoire: (repertoireId: string, variantName?: string) => void;
  markDone: (planId: string, lineKey: string, done: boolean) => Promise<void>;
};

const TrainingTab: React.FC<TrainingTabProps> = ({
  trainingPlanId,
  actionableTrainingItems,
  signalLines,
  trainingItemsWithErrors,
  highPriorityTrainingItems,
  offBookSignalCount,
  openingTargetFromLine,
  openRepertoire,
  openTrainRepertoire,
  markDone,
}) => (
  <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <div className="xl:col-span-2 bg-slate-900/80 rounded-lg border border-slate-700 p-3">
      <p className="text-xs text-slate-300">
        Actionable items: <span className="text-slate-100 font-semibold">{actionableTrainingItems.length}</span>
        {" | "}High priority: <span className="text-slate-100 font-semibold">{highPriorityTrainingItems}</span>
        {" | "}With errors: <span className="text-slate-100 font-semibold">{trainingItemsWithErrors}</span>
        {" | "}Off-book signals: <span className="text-slate-100 font-semibold">{offBookSignalCount}</span>
      </p>
    </div>
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2 xl:max-h-[72vh] xl:overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-100">Training Plan (Action Queue)</h2>
      <p className="text-xs text-slate-400">Direct tasks for matched variants. Ordered by training errors and priority.</p>
      {actionableTrainingItems.map((item, index) => {
        const target = openingTargetFromLine(item.lineKey);
        return (
          <div key={item.lineKey} className="bg-slate-800/90 rounded p-3 space-y-1">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <p className="text-sm font-medium text-slate-100">#{index + 1} {buildLineTitle(item.openingName, item.variantName, item.repertoireName)}</p>
              <div className="flex items-center gap-2">
                {target ? (
                  <>
                    <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(target.repertoireId, target.variantName)}>See</button>
                    <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(target.repertoireId, target.variantName)}>Train</button>
                  </>
                ) : null}
                <label className="text-xs text-slate-300 flex items-center gap-1">
                  <input type="checkbox" checked={item.done} onChange={(event) => { if (trainingPlanId) { void markDone(trainingPlanId, item.lineKey, event.target.checked); } }} />
                  Done
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-400">Priority {item.priority.toFixed(2)} | {item.effort} | Games {item.games} | Errors {item.trainingErrors || 0}{item.trainingDueAt ? ` | Due ${formatDateTime(item.trainingDueAt)}` : ""}</p>
            {item.reasons.length > 0 ? <p className="text-xs text-amber-200">Why: {item.reasons.slice(0, 2).join(" | ")}</p> : null}
            {item.tasks.length > 0 ? <p className="text-xs text-slate-300">Do: {item.tasks.slice(0, 2).join(" | ")}</p> : null}
            <p className="text-sm text-slate-200">{item.movesSan.join(" ")}</p>
          </div>
        );
      })}
      {actionableTrainingItems.length === 0 ? <p className="text-sm text-slate-400">No matched actionable items for current filters.</p> : null}
    </div>

    <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-2 xl:max-h-[72vh] xl:overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-100">Lines To Focus (Signals)</h2>
      <p className="text-xs text-slate-400">Signals from games. Use this to understand why lines appear in your plan.</p>
      {signalLines.map((line) => {
        const target = openingTargetFromLine(line.lineKey);
        return (
          <div key={line.lineKey} className="bg-slate-800/90 rounded p-3 space-y-1">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <p className="text-sm font-medium text-slate-100">{buildLineTitle(line.openingName, line.variantName, line.repertoireName)}</p>
              {target ? (
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 rounded bg-slate-700" onClick={() => openRepertoire(target.repertoireId, target.variantName)}>See</button>
                  <button className="text-xs px-2 py-1 rounded bg-blue-600" onClick={() => openTrainRepertoire(target.repertoireId, target.variantName)}>Train</button>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-slate-400">Games {line.games} | W {line.wins} D {line.draws} L {line.losses} | Manual review {line.manualReviewGames} | Errors {line.trainingErrors || 0}</p>
            <p className="text-xs text-slate-400">Mapping confidence {formatPercent(line.averageMappingConfidence)} | Deviation {formatPercent(line.deviationRate)}</p>
            <p className="text-sm text-slate-200">{line.movesSan.join(" ")}</p>
          </div>
        );
      })}
      {signalLines.length === 0 ? <p className="text-sm text-slate-400">No focus lines for current filters.</p> : null}
    </div>
  </section>
);

export default TrainingTab;
