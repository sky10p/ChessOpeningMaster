import React, { memo, useCallback } from "react";
import { Study, StudyEntry, StudySession } from "../models";
import TagDisplay from "./display/TagDisplay";
import TimerControls from "./controls/TimerControls";
import SessionsList from "./lists/SessionsList";
import EntryList from "./lists/EntryList";

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
  onDeleteStudy: () => void;
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
  onDeleteStudy,
}) => {
  const handleDeleteStudy = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this study?')) {
      onDeleteStudy();
    }
  }, [onDeleteStudy]);

  const totalTime = sessions.reduce((a, s) => a + s.duration, 0);
  
  return (
    <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-lg p-2 sm:p-6 animate-fade-in mb-10">
      <div className="flex items-center justify-between mb-4">
        <button className="text-blue-400 hover:underline" onClick={onBack}>
          ← Back to studies
        </button>
        <button className="text-red-400 hover:underline" onClick={handleDeleteStudy}>
          Delete Study
        </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h2 className="text-xl font-bold text-white mr-2">{study.name}</h2>
        <TagDisplay tags={study.tags} />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={onShowNewEntry}>
          + Add Study
        </button>
        {entrySuccess && <span className="text-green-400 text-xs">{entrySuccess}</span>}
        {entryError && <span className="text-red-400 text-xs">{entryError}</span>}
      </div>
      
      <TimerControls 
        timerState={timerState}
        onStartTimer={onStartTimer}
        onPauseTimer={onPauseTimer}
        onResumeTimer={onResumeTimer}
        onFinishTimer={onFinishTimer}
        onShowManualTime={onShowManualTime}
      />
      
      <SessionsList 
        sessions={sessions}
        onDeleteSession={onDeleteSession}
        totalTime={totalTime}
      />
      
      <EntryList 
        entries={study.entries || []}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />
    </div>
  );
};

export default memo(StudyDetail);
