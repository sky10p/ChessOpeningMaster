export type DateType = string | Date | { $date: string };

type ErrorWithStatus = Error & { status?: number };

export const normalizeDate = (date: DateType): string => {
  return typeof date === 'object' && '$date' in date ? date.$date : date as string;
};

export const parseDateStringOrThrow = (value: string, fieldName: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error: ErrorWithStatus = new Error(`Invalid ${fieldName} date`);
    error.status = 400;
    throw error;
  }
  return date;
};

export const getEarlierDate = (date1: DateType, date2: DateType): DateType => {
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  return new Date(normalizedDate1) < new Date(normalizedDate2) ? date1 : date2;
};