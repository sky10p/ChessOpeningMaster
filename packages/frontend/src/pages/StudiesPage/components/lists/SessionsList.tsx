import React from "react";
import { formatDuration } from "../../utils";
import { StudySession } from "../../models";

interface SessionsListProps {
  sessions: StudySession[];
  onDeleteSession: (sessionId: string) => void;
  totalTime: number;
}

const SessionsList: React.FC<SessionsListProps> = ({ 
  sessions, 
  onDeleteSession,
  totalTime
}) => {
  return (
    <div className="mb-6">
      <div className="text-slate-300 text-sm mb-1">
        Total time: {formatDuration(totalTime)}
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
        {sessions.length === 0 && <li className="text-slate-500">No sessions yet.</li>}
      </ol>
    </div>
  );
};

export default SessionsList;
