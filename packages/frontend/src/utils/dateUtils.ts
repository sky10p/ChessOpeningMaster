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

export const toLocalDateKey = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isToday = (date: Date): boolean => {
  return toLocalDateKey(date) === toLocalDateKey(new Date());
};
