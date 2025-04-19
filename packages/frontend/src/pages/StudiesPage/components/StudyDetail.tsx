import React from "react";
import { formatDuration } from "../utils";
import { Study, StudyEntry, StudySession } from "../models";

interface StudyDetailProps {
  study: Study;
  onBack: () => void;
  onShowNewEntry: () => void;
  entrySuccess: string | null;
  entryError: string | null;
  onEditEntry: (entry: StudyEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onShowManualTime: () => void;
  timerState: {
    running: boolean;
    start: Date | null;
    elapsed: number;
  };
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onFinishTimer: () => void;
  sessions: StudySession[];
  onDeleteSession: (sessionId: string) => void;
}

const StudyDetail: React.FC<StudyDetailProps> = ({
  study,
  onBack,
  onShowNewEntry,
  entrySuccess,
  entryError,
  onEditEntry,
  onDeleteEntry,
  onShowManualTime,
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onFinishTimer,
  sessions,
  onDeleteSession,
}) => (
  <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-lg p-2 sm:p-6 animate-fade-in">
    <button className="mb-4 text-blue-400 hover:underline" onClick={onBack}>
      ← Back to studies
    </button>
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <h2 className="text-xl font-bold text-white mr-2">{study.name}</h2>
      {study.tags.map((tag) => (
        <span key={tag} className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs">{tag}</span>
      ))}
    </div>
    <div className="flex items-center gap-2 mb-4">
      <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={onShowNewEntry}>
        + Add Study
      </button>
      {entrySuccess && <span className="text-green-400 text-xs">{entrySuccess}</span>}
      {entryError && <span className="text-red-400 text-xs">{entryError}</span>}
    </div>
    <div className="mb-6">
      <div className="flex flex-wrap gap-4 items-center mb-2">
        {/* Timer controls */}
        {!timerState.running && !timerState.start && (
          <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={onStartTimer}>
            Iniciar cronómetro
          </button>
        )}
        {timerState.running && (
          <>
            <span className="font-mono text-lg text-green-400">{formatDuration(timerState.elapsed)}</span>
            <button className="px-2 py-1 bg-yellow-600 text-white rounded" onClick={onPauseTimer}>
              Pausar
            </button>
            <button className="px-2 py-1 bg-red-700 text-white rounded" onClick={onFinishTimer}>
              Finalizar sesión
            </button>
          </>
        )}
        {!timerState.running && timerState.start && (
          <>
            <span className="font-mono text-lg text-yellow-400">{formatDuration(timerState.elapsed)}</span>
            <button className="px-2 py-1 bg-blue-700 text-white rounded" onClick={onResumeTimer}>
              Reanudar
            </button>
            <button className="px-2 py-1 bg-red-700 text-white rounded" onClick={onFinishTimer}>
              Finalizar sesión
            </button>
          </>
        )}
        <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={onShowManualTime}>
          + Añadir tiempo manualmente
        </button>
      </div>
      {/* Total y sesiones */}
      <div className="text-slate-300 text-sm mb-1">
        Total tiempo dedicado: {formatDuration(sessions.reduce((a, s) => a + s.duration, 0))}
      </div>
      <ol className="space-y-1">
        {sessions.map((s) => (
          <li key={s.id} className="text-xs text-slate-400 flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center">
            <span>{new Date(s.start).toLocaleDateString()} {s.manual ? "(manual)" : ""}</span>
            <span className="font-mono">{formatDuration(s.duration)}</span>
            {s.comment && <span className="italic text-slate-500">{s.comment}</span>}
            <button
              className="ml-auto px-2 py-0.5 bg-red-600 text-white rounded text-xs"
              title="Delete session"
              onClick={() => onDeleteSession(s.id)}
            >
              🗑
            </button>
          </li>
        ))}
        {sessions.length === 0 && <li className="text-slate-500">Sin sesiones aún.</li>}
      </ol>
    </div>
    <ol className="space-y-3">
      {(study.entries || []).map((entry, idx) => (
        <li key={entry.id} className="bg-slate-900 rounded p-2 sm:p-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <span className="font-bold text-slate-400">{idx + 1}.</span>
          <div className="flex-1">
            <div className="font-semibold text-white break-words">{entry.title}</div>
            <div className="text-slate-300 text-sm mb-1 break-words">{entry.description}</div>
            <a
              href={entry.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline text-xs"
            >
              View External Study ↗
            </a>
          </div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-yellow-600 text-white rounded text-xs"
              onClick={() => onEditEntry(entry)}
            >
              Edit
            </button>
            <button
              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
              onClick={() => onDeleteEntry(entry.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      {(study.entries || []).length === 0 && (
        <li className="text-slate-400 text-sm">No studies yet.</li>
      )}
    </ol>
  </div>
);

export default StudyDetail;
