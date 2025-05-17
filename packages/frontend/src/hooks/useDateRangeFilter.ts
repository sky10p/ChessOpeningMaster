import { useState, useMemo } from 'react';
import { getTodayAtMidnight, setToMidnight } from '../utils/dateUtils';

interface UseDateRangeFilterOptions {
  initialStartDate?: Date;
  initialEndDate?: Date;
}

interface UseDateRangeFilterResult<T> {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setToday: () => void;
  setThisWeek: () => void;
  setThisMonth: () => void;
  filterItems: (items: T[], dateAccessor: (item: T) => string | Date) => T[];
  filteredItems: T[];
}

export function useDateRangeFilter<T>(
  items: T[],
  dateAccessor: (item: T) => string | Date,
  options: UseDateRangeFilterOptions = {}
): UseDateRangeFilterResult<T> {
  const today = getTodayAtMidnight();
  
  const [startDate, setStartDateRaw] = useState<Date>(
    options.initialStartDate ? setToMidnight(options.initialStartDate) : today
  );
  const [endDate, setEndDateRaw] = useState<Date>(
    options.initialEndDate ? setToMidnight(options.initialEndDate) : today
  );

  const setStartDate = (date: Date) => {
    const newStartDate = setToMidnight(date);
    setStartDateRaw(newStartDate);
    
    if (endDate < newStartDate) {
      setEndDateRaw(newStartDate);
    }
  };

  const setEndDate = (date: Date) => {
    const newEndDate = setToMidnight(date);
    setEndDateRaw(newEndDate);
    
    if (startDate > newEndDate) {
      setStartDateRaw(newEndDate);
    }
  };

  const setToday = () => {
    setStartDateRaw(today);
    setEndDateRaw(today);
  };

  const setThisWeek = () => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    setStartDateRaw(weekStart);
    setEndDateRaw(today);
  };

  const setThisMonth = () => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDateRaw(monthStart);
    setEndDateRaw(today);
  };

  const filterItems = (itemsToFilter: T[], itemDateAccessor: (item: T) => string | Date) => {
    return itemsToFilter.filter(item => {
      const itemDate = itemDateAccessor(item);
      const dateObj = itemDate instanceof Date ? itemDate : new Date(itemDate);
      const normalizedDate = setToMidnight(dateObj);
      
      return normalizedDate >= startDate && normalizedDate <= endDate;
    });
  };

  const filteredItems = useMemo(() => {
    return filterItems(items, dateAccessor);
  }, [items, dateAccessor, startDate, endDate]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setToday,
    setThisWeek,
    setThisMonth,
    filterItems,
    filteredItems
  };
}
