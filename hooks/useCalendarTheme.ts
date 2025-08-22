import { THEME_COLORS } from "@/constants/AppConstants";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { DayItem } from "@/types";
import { isSameDay, isToday, parseISO } from "date-fns";
import { useCallback, useMemo } from "react";
import { TextStyle } from "react-native";

interface DayItemStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  fontWeight?: TextStyle['fontWeight'];
  fontSize?: number;
}

/**
 * Custom hook for managing calendar theme colors and style calculations
 */
export function useCalendarTheme(selectedDate: string, editedDates: string[]) {
  // Theme colors
  const backgroundColor = useThemeColor({}, "calendarBackground");
  const borderColor = useThemeColor({}, "calendarBorder");
  const todayColor = useThemeColor({}, "calendarToday");
  const selectedColor = useThemeColor({}, "calendarSelected");
  const textColor = useThemeColor({}, "calendarText");
  const editedColor = THEME_COLORS.EDITED_INDICATOR;
  const filledBackgroundColor = useThemeColor({}, "calendarFilledBackground");

  // Memoize expensive date calculations
  const selectedDateParsed = useMemo(() => parseISO(selectedDate), [selectedDate]);
  const editedDatesSet = useMemo(() => new Set(editedDates), [editedDates]);

  /**
   * Calculates the appropriate styles for a day item based on its state
   */
  const getDayItemStyles = useCallback(
    (item: DayItem): DayItemStyle => {
      const isSelectedDay = isSameDay(selectedDateParsed, item.date);
      const isTodayDay = isToday(item.date);
      const isEditedDay = editedDatesSet.has(item.dateString);

      let itemBackgroundColor: string = THEME_COLORS.TRANSPARENT;
      let itemBorderColor: string = THEME_COLORS.TRANSPARENT;
      let itemTextColor: string = textColor;
      let fontWeight: TextStyle['fontWeight'];
      let fontSize: number | undefined;

      // Apply filled day styling first (background)
      if (isEditedDay) {
        itemBackgroundColor = filledBackgroundColor;
      }

      // Apply selected day styling (border)
      if (isSelectedDay) {
        itemBorderColor = selectedColor;
        itemTextColor = selectedColor;
      }

      // Apply today styling (font styling) - this can combine with other states
      if (isTodayDay) {
        fontWeight = "bold";
        fontSize = 20;
        // Only change text color if it hasn't been set by selected state
        if (!isSelectedDay) {
          itemTextColor = todayColor;
        }
      }

      return {
        backgroundColor: itemBackgroundColor,
        borderColor: itemBorderColor,
        textColor: itemTextColor,
        borderWidth: itemBorderColor !== THEME_COLORS.TRANSPARENT ? 2 : 0,
        fontWeight,
        fontSize,
      };
    },
    [selectedDateParsed, editedDatesSet, textColor, todayColor, selectedColor, editedColor, filledBackgroundColor]
  );

  /**
   * Gets the main container styles
   */
  const getContainerStyles = useCallback(() => ({
    backgroundColor,
    borderBottomColor: borderColor,
  }), [backgroundColor, borderColor]);

  /**
   * Gets the today button styles
   */
  const getTodayButtonStyles = useCallback(() => ({
    borderColor: todayColor,
    textColor: todayColor,
  }), [todayColor]);

  /**
   * Gets the month text styles
   */
  const getMonthTextStyles = useCallback(() => ({
    color: textColor,
  }), [textColor]);

  return {
    colors: {
      backgroundColor,
      borderColor,
      todayColor,
      selectedColor,
      textColor,
      editedColor,
    },
    getDayItemStyles,
    getContainerStyles,
    getTodayButtonStyles,
    getMonthTextStyles,
  };
}