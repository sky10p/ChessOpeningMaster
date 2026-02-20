import React from "react";
import { LineStudyCandidate, TrainingPlanItem } from "@chess-opening-master/common";
import { buildLineTitle, formatDateTime, formatPercent } from "../utils";

type TrainingTabProps = {
  trainingPlanId?: string;
  actionableTrainingItems: Array<TrainingPlanItem & {
    mappingConfidence?: number;
    manualReviewRate?: number;
    pathHint?: "errors" | "due" | "map" | "new" | "study";
    whyNow?: string[];
  }>;
  signalLines: LineStudyCandidate[];
  trainingItemsWithErrors: number;
  highPriorityTrainingItems: number;
  offBookSignalCount: number;
  openingTargetFromLine: (lineKey: string) => { repertoireId: string; variantName: string } | null;
  openRepertoire: (repertoireId: string, variantName?: string) => void;
  openTrainRepertoire: (repertoireId: string, variantName?: string) => void;
  markDone: (planId: string, lineKey: string, done: boolean) => Promise<void>;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">{children}</p>
);

const confidenceTone = (confidence: number): string => {
  if (confidence >= 0.8) return "text-emerald-400 border-emerald-900/60 bg-emerald-950/20";
  if (confidence >= 0.6) return "text-amber-300 border-amber-900/60 bg-amber-950/20";
  return "text-rose-300 border-rose-900/60 bg-rose-950/20";
};

const pathHintTone: Record<"errors" | "due" | "map" | "new" | "study", string> = {
  errors: "text-rose-300 border-rose-900/60 bg-rose-950/20",
  due: "text-amber-300 border-amber-900/60 bg-amber-950/20",
  map: "text-violet-300 border-violet-900/60 bg-violet-950/20",
  new: "text-blue-300 border-blue-900/60 bg-blue-950/20",
  study: "text-slate-300 border-slate-700 bg-slate-800/40",
};

const pathHintLabel: Record<"errors" | "due" | "map" | "new" | "study", string> = {
  errors: "Errors-first",
  due: "Due-now",
  map: "Needs-mapping",
  new: "High-activity",
  study: "Build-line",
};

const ActionButtons: React.FC<{
  target: { repertoireId: string; variantName: string } | null;
  openRepertoire: (id: string, name: string) => void;
  openTrainRepertoire: (id: string, name: string) => void;
}> = ({ target, openRepertoire, openTrainRepertoire }) => {
  if (!target) return null;
  return (
    <div className="flex gap-1.5 shrink-0">
      <button className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors" onClick={() => openRepertoire(target.repertoireId, target.variantName)}>View</button>
      <button className="text-xs px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => openTrainRepertoire(target.repertoireId, target.variantName)}>Train</button>
    </div>
  );
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
  <div className="space-y-4">
    <div className="flex flex-wrap gap-2">
      {[
        { label: "Actionable", value: actionableTrainingItems.length, color: "text-slate-100" },
        { label: "High Priority", value: highPriorityTrainingItems, color: "text-amber-400" },
        { label: "With Errors", value: trainingItemsWithErrors, color: "text-rose-400" },
        { label: "Off-Book", value: offBookSignalCount, color: "text-blue-400" },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg border border-slate-800">
          <span className={`text-sm font-semibold ${color}`}>{value}</span>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 xl:max-h-[68vh] xl:overflow-y-auto">
        <SectionTitle>Training Queue</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">Includes mapped variants and high-signal lines that still need mapping.</p>
        {actionableTrainingItems.length === 0
          ? <p className="text-sm text-slate-500">No matched items for current filters.</p>
          : <div className="space-y-3">
              {actionableTrainingItems.map((item, index) => {
                const target = openingTargetFromLine(item.lineKey);
                const mappingConfidence = item.mappingConfidence ?? 0;
                const manualReviewRate = item.manualReviewRate ?? 0;
                const pathHint = item.pathHint ?? "study";
                const whyNow = item.whyNow ?? [];
                return (
                  <div key={item.lineKey} className="rounded-lg border border-slate-800 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-100 leading-snug">
                        <span className="text-slate-500 mr-1">#{index + 1}</span>
                        {buildLineTitle(item.openingName, item.variantName, item.repertoireName)}
                      </p>
                      <ActionButtons target={target} openRepertoire={openRepertoire} openTrainRepertoire={openTrainRepertoire} />
                    </div>
                    <p className="text-xs font-mono text-slate-400">{item.movesSan.join(" ")}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>Priority {item.priority.toFixed(1)}</span>
                      <span>{item.effort}</span>
                      <span>{item.games}g</span>
                      {item.trainingErrors ? <span className="text-rose-400">{item.trainingErrors} errors</span> : null}
                      {item.trainingDueAt ? <span>Due {formatDateTime(item.trainingDueAt)}</span> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className={`px-2 py-0.5 rounded border ${confidenceTone(mappingConfidence)}`}>
                        Mapping {formatPercent(mappingConfidence)}
                      </span>
                      <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800/40 text-slate-300">
                        Manual review {formatPercent(manualReviewRate)}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${pathHintTone[pathHint]}`}>
                        {pathHintLabel[pathHint]}
                      </span>
                    </div>
                    {whyNow.length > 0
                      ? <p className="text-xs text-blue-200">Why now: {whyNow.slice(0, 2).join(" · ")}</p>
                      : null
                    }
                    {item.reasons.length > 0
                      ? <p className="text-xs text-amber-300">{item.reasons.slice(0, 2).join(" · ")}</p>
                      : null
                    }
                    {item.tasks.length > 0
                      ? <p className="text-xs text-slate-400">{item.tasks.slice(0, 2).join(" · ")}</p>
                      : null
                    }
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer w-fit">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(e) => { if (trainingPlanId) { void markDone(trainingPlanId, item.lineKey, e.target.checked); } }}
                        className="rounded border-slate-600"
                      />
                      Mark done
                    </label>
                  </div>
                );
              })}
            </div>
        }
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 xl:max-h-[68vh] xl:overflow-y-auto">
        <SectionTitle>Focus Lines</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">Lines from your games that generated training signals.</p>
        {signalLines.length === 0
          ? <p className="text-sm text-slate-500">No focus lines for current filters.</p>
          : <div className="space-y-3">
              {signalLines.map((line) => {
                const target = openingTargetFromLine(line.lineKey);
                return (
                  <div key={line.lineKey} className="rounded-lg border border-slate-800 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-100 leading-snug">
                        {buildLineTitle(line.openingName, line.variantName, line.repertoireName)}
                      </p>
                      <ActionButtons target={target} openRepertoire={openRepertoire} openTrainRepertoire={openTrainRepertoire} />
                    </div>
                    <p className="text-xs font-mono text-slate-400">{line.movesSan.join(" ")}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{line.games}g</span>
                      <span className="text-emerald-500">{line.wins}W</span>
                      <span className="text-slate-400">{line.draws}D</span>
                      <span className="text-rose-400">{line.losses}L</span>
                      {line.trainingErrors ? <span className="text-rose-400">{line.trainingErrors} errors</span> : null}
                      <span>Conf. {formatPercent(line.averageMappingConfidence)}</span>
                      <span>Dev. {formatPercent(line.deviationRate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  </div>
);

export default TrainingTab;
