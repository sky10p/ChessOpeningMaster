export const setToMidnight = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const getTodayAtMidnight = (): Date => {
  return setToMidnight(new Date());
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getStartOfWeek = (): Date => {
  const today = getTodayAtMidnight();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  return weekStart;
};

export const getStartOfMonth = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return setToMidnight(date1).getTime() === setToMidnight(date2).getTime();
};
