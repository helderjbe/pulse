import { CALENDAR_CONSTANTS } from "@/constants/AppConstants";
import type { DayItem } from "@/types";
import { addDays, format } from "date-fns";
import { useCallback, useMemo, useState } from "react";

const { INITIAL_DAYS_COUNT, BATCH_SIZE } = CALENDAR_CONSTANTS;

/**
 * Custom hook for managing calendar data generation and infinite scrolling
 */
export function useCalendarData() {
  const [dayItems, setDayItems] = useState<DayItem[]>([]);

  // Generate initial day items - memoize to prevent recreation
  const initialDayItems = useMemo(() => {
    const today = new Date();
    const items: DayItem[] = [];

    // Generate days from -INITIAL_DAYS_COUNT to +INITIAL_DAYS_COUNT
    for (let i = -INITIAL_DAYS_COUNT; i <= INITIAL_DAYS_COUNT; i++) {
      const date = addDays(today, i);
      items.push({
        date,
        dateString: format(date, "yyyy-MM-dd"),
        index: i + INITIAL_DAYS_COUNT,
      });
    }

    return items;
  }, []); // Empty deps - only generate once

  /**
   * Initializes the calendar with the initial day items
   */
  const initializeCalendar = useCallback(() => {
    setDayItems(initialDayItems);
  }, [initialDayItems]);

  /**
   * Extends data when reaching the end of the list
   */
  const extendToEnd = useCallback(() => {
    setDayItems((prevItems) => {
      const lastItem = prevItems[prevItems.length - 1];
      if (!lastItem) return prevItems;

      const newItems: DayItem[] = [];
      for (let i = 1; i <= BATCH_SIZE; i++) {
        const date = addDays(lastItem.date, i);
        newItems.push({
          date,
          dateString: format(date, "yyyy-MM-dd"),
          index: lastItem.index + i,
        });
      }
      return [...prevItems, ...newItems];
    });
  }, []); // No dependencies needed with functional update

  /**
   * Extends data when reaching the start of the list
   */
  const extendToStart = useCallback(() => {
    setDayItems((prevItems) => {
      const firstItem = prevItems[0];
      if (!firstItem) return prevItems;

      const newItems: DayItem[] = [];
      for (let i = BATCH_SIZE; i >= 1; i--) {
        const date = addDays(firstItem.date, -i);
        newItems.push({
          date,
          dateString: format(date, "yyyy-MM-dd"),
          index: firstItem.index - i,
        });
      }
      return [...newItems, ...prevItems];
    });
  }, []); // No dependencies needed with functional update

  /**
   * Gets the current month display text based on the center item
   */
  const getCurrentMonth = useCallback((centerDate: Date): string => {
    return format(centerDate, "MMM yyyy");
  }, []);

  return {
    dayItems,
    initializeCalendar,
    extendToEnd,
    extendToStart,
    getCurrentMonth,
  };
}