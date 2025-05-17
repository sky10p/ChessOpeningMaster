import React from "react";
import { formatDateForInput, getTodayAtMidnight, getStartOfWeek, getStartOfMonth } from "../../utils/dateUtils";

interface CalendarRangeDateFilterProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onSetToday?: () => void;
  onSetThisWeek?: () => void;
  onSetThisMonth?: () => void;
}

const CalendarRangeDateFilter: React.FC<CalendarRangeDateFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSetToday,
  onSetThisWeek,
  onSetThisMonth
}) => {
  const handleSetToday = () => {
    if (onSetToday) {
      onSetToday();
    } else {
      const today = getTodayAtMidnight();
      onStartDateChange(today);
      onEndDateChange(today);
    }
  };

  const handleSetThisWeek = () => {
    if (onSetThisWeek) {
      onSetThisWeek();
    } else {
      const weekStart = getStartOfWeek();
      const today = getTodayAtMidnight();
      onStartDateChange(weekStart);
      onEndDateChange(today);
    }
  };

  const handleSetThisMonth = () => {
    if (onSetThisMonth) {
      onSetThisMonth();
    } else {
      const monthStart = getStartOfMonth();
      const today = getTodayAtMidnight();
      onStartDateChange(monthStart);
      onEndDateChange(today);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-slate-400">From:</span>
        <input
          type="date"
          value={formatDateForInput(startDate)}
          onChange={(e) => {
            if (e.target.value) {
              const newDate = new Date(e.target.value);
              newDate.setHours(0, 0, 0, 0);
              onStartDateChange(newDate);
            }
          }}
          className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 text-xs"
        />
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-slate-400">To:</span>
        <input
          type="date"
          value={formatDateForInput(endDate)}
          onChange={(e) => {
            if (e.target.value) {
              const newDate = new Date(e.target.value);
              newDate.setHours(0, 0, 0, 0);
              onEndDateChange(newDate);
            }
          }}
          className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 text-xs"
        />
      </div>

      <div className="flex gap-1 ml-1">
        <button 
          onClick={handleSetToday}
          className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded" 
          title="Show today only"
        >
          Today
        </button>
        <button 
          onClick={handleSetThisWeek}
          className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded" 
          title="Show this week"
        >
          Week
        </button>
        <button 
          onClick={handleSetThisMonth}
          className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded" 
          title="Show this month"
        >
          Month
        </button>
      </div>
    </div>
  );
};

export default CalendarRangeDateFilter;
