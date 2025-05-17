import React, { useMemo } from "react";
import { formatDuration } from "../../utils";
import { StudySession } from "../../models";
import CalendarRangeDateFilter from "../../../../components/basic/CalendarRangeDateFilter";
import { useDateRangeFilter } from "../../../../hooks/useDateRangeFilter";
import { getDateRangeDisplayText } from "../../../../utils/displayUtils";

interface SessionsListProps {
  sessions: StudySession[];
  onDeleteSession: (sessionId: string) => void;
  totalTime: number;
}

const SessionsList: React.FC<SessionsListProps> = ({ 
  sessions, 
  onDeleteSession
}) => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setToday,
    setThisWeek,
    setThisMonth,
    filteredItems: filteredSessions
  } = useDateRangeFilter(
    sessions,
    (session) => session.start
  );
  
  const filteredTotalTime = useMemo(() => {
    return filteredSessions.reduce((total, session) => total + session.duration, 0);
  }, [filteredSessions]);
  
  const dateRangeDisplayText = getDateRangeDisplayText(startDate, endDate);
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="text-slate-300 text-sm">
          {dateRangeDisplayText} time: {formatDuration(filteredTotalTime)}
        </div>
        
        <CalendarRangeDateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSetToday={setToday}
          onSetThisWeek={setThisWeek}
          onSetThisMonth={setThisMonth}
        />
      </div>
      
      <ol className="space-y-1">
        {filteredSessions.map((s) => (
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
        {filteredSessions.length === 0 && (
          <li className="text-slate-500">
            No sessions found for this date range.
          </li>
        )}
      </ol>
    </div>
  );
};

export default SessionsList;
