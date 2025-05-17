import { isSameDay, getTodayAtMidnight } from './dateUtils';

export const getDateRangeDisplayText = (startDate: Date, endDate: Date): string => {
  const today = getTodayAtMidnight();
  
  if (isSameDay(startDate, endDate)) {
    if (isSameDay(startDate, today)) {
      return "Today's";
    }
    return `${startDate.toLocaleDateString()}'s`;
  }
  return 'Range';
};
