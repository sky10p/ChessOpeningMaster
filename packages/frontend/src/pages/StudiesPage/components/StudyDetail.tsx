import React, { memo, useCallback } from "react";
import { ArrowLeftIcon, ClockIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Card } from "../../../components/ui";
import { Study, StudyEntry, StudySession } from "../models";
import { formatDuration } from "../utils";
import TagDisplay from "./display/TagDisplay";
import TimerControls from "./controls/TimerControls";
import SessionsList from "./lists/SessionsList";
import EntryList from "./lists/EntryList";

interface StudyDetailProps {
  study: Study;
  groupName?: string;
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
  groupName,
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
    if (window.confirm("Are you sure you want to delete this study?")) {
      onDeleteStudy();
    }
  }, [onDeleteStudy]);

  const totalTime = sessions.reduce((total, session) => total + session.duration, 0);

  return (
    <div className="space-y-4">
      <Card padding="relaxed" className="w-full">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Button type="button" intent="ghost" size="sm" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to studies
          </Button>
          <Button type="button" intent="danger" size="sm" onClick={handleDeleteStudy}>
            <TrashIcon className="h-4 w-4" />
            Delete Study
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {groupName && <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">{groupName}</div>}
          <h2 className="text-2xl font-bold text-text-base">{study.name}</h2>
          <TagDisplay tags={study.tags} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" intent="primary" size="sm" onClick={onShowNewEntry}>
            <PlusIcon className="h-4 w-4" />
            Add Entry
          </Button>
          <Button type="button" intent="accent" size="sm" onClick={onShowManualTime}>
            <ClockIcon className="h-4 w-4" />
            Add Manual Time
          </Button>
        </div>

        {(entrySuccess || entryError) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entrySuccess && <span className="rounded bg-success/10 px-2 py-1 text-xs font-medium text-success">{entrySuccess}</span>}
            {entryError && <span className="rounded bg-danger/10 px-2 py-1 text-xs font-medium text-danger">{entryError}</span>}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card padding="default" className="w-full">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-text-base">Entries</h3>
                <p className="text-sm text-text-muted">
                  {study.entries.length} {study.entries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
            </div>
            <EntryList
              entries={study.entries || []}
              onEditEntry={onEditEntry}
              onDeleteEntry={onDeleteEntry}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <Card padding="default">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-text-base">Practice</h3>
              <p className="text-sm text-text-muted">
                {formatDuration(totalTime)} tracked across {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>
            <TimerControls
              timerState={timerState}
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResumeTimer={onResumeTimer}
              onFinishTimer={onFinishTimer}
              onShowManualTime={onShowManualTime}
            />
          </Card>

          <Card padding="default">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-text-base">Sessions</h3>
              <p className="text-sm text-text-muted">Review and manage your logged study time.</p>
            </div>
            <SessionsList
              sessions={sessions}
              onDeleteSession={onDeleteSession}
              totalTime={totalTime}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default memo(StudyDetail);
