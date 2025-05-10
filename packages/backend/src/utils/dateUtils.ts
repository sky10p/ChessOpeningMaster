export type DateType = string | Date | { $date: string };

export const normalizeDate = (date: DateType): string => {
  return typeof date === 'object' && '$date' in date ? date.$date : date as string;
};

export const getEarlierDate = (date1: DateType, date2: DateType): DateType => {
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  return new Date(normalizedDate1) < new Date(normalizedDate2) ? date1 : date2;
};