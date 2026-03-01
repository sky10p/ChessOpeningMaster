import React, { useMemo } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { EmptyState, IconButton } from "../../../../components/ui";
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
  onDeleteSession,
}) => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setToday,
    setThisWeek,
    setThisMonth,
    filteredItems: filteredSessions,
  } = useDateRangeFilter(
    sessions,
    (session) => session.start
  );

  const filteredTotalTime = useMemo(() => {
    return filteredSessions.reduce((total, session) => total + session.duration, 0);
  }, [filteredSessions]);

  const dateRangeDisplayText = getDateRangeDisplayText(startDate, endDate);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-sm text-text-muted">
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

      {filteredSessions.length === 0 ? (
        <EmptyState
          variant="inline"
          title="No sessions found"
          description="Try a different date range or log your next study session."
        />
      ) : (
        <ol className="space-y-2">
          {filteredSessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-raised px-3 py-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium text-text-base">
                    {new Date(session.start).toLocaleDateString()} {session.manual ? "(manual)" : ""}
                  </div>
                  <div className="font-mono text-xs text-text-muted">{formatDuration(session.duration)}</div>
                  {session.comment && <div className="text-xs italic text-text-subtle">{session.comment}</div>}
                </div>
                <IconButton
                  label="Delete session"
                  title="Delete session"
                  onClick={() => onDeleteSession(session.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default SessionsList;
