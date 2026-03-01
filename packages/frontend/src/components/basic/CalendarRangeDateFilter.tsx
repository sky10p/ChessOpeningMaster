import React from "react";
import { Button, Input } from "../ui";
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
  onSetThisMonth,
}) => {
  const handleSetToday = () => {
    if (onSetToday) {
      onSetToday();
      return;
    }

    const today = getTodayAtMidnight();
    onStartDateChange(today);
    onEndDateChange(today);
  };

  const handleSetThisWeek = () => {
    if (onSetThisWeek) {
      onSetThisWeek();
      return;
    }

    const weekStart = getStartOfWeek();
    const today = getTodayAtMidnight();
    onStartDateChange(weekStart);
    onEndDateChange(today);
  };

  const handleSetThisMonth = () => {
    if (onSetThisMonth) {
      onSetThisMonth();
      return;
    }

    const monthStart = getStartOfMonth();
    const today = getTodayAtMidnight();
    onStartDateChange(monthStart);
    onEndDateChange(today);
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input
        type="date"
        label="From"
        size="sm"
        value={formatDateForInput(startDate)}
        onChange={(event) => {
          if (event.target.value) {
            const newDate = new Date(event.target.value);
            newDate.setHours(0, 0, 0, 0);
            onStartDateChange(newDate);
          }
        }}
        className="w-[9.5rem]"
      />

      <Input
        type="date"
        label="To"
        size="sm"
        value={formatDateForInput(endDate)}
        onChange={(event) => {
          if (event.target.value) {
            const newDate = new Date(event.target.value);
            newDate.setHours(0, 0, 0, 0);
            onEndDateChange(newDate);
          }
        }}
        className="w-[9.5rem]"
      />

      <div className="flex flex-wrap gap-1 pb-px">
        <Button type="button" intent="secondary" size="xs" onClick={handleSetToday} title="Show today only">
          Today
        </Button>
        <Button type="button" intent="secondary" size="xs" onClick={handleSetThisWeek} title="Show this week">
          Week
        </Button>
        <Button type="button" intent="secondary" size="xs" onClick={handleSetThisMonth} title="Show this month">
          Month
        </Button>
      </div>
    </div>
  );
};

export default CalendarRangeDateFilter;
