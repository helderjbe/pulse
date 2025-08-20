import { UI_CONSTANTS } from "@/constants/AppConstants";
import type { HorizontalDayViewerProps } from "@/types";
import { format } from "date-fns";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  CalendarErrorBoundary,
  CalendarHeader,
  CalendarList,
  useCalendarData,
  useCalendarScroll,
  useCalendarTheme,
} from "./calendar";

/**
 * A horizontal scrollable calendar component that allows users to navigate between dates.
 * Features infinite scrolling, haptic feedback, and visual indicators for today, selected, and edited dates.
 * 
 * @param onDateSelect - Callback function called when a date is selected
 * @param selectedDate - Currently selected date in YYYY-MM-DD format
 * @param editedDates - Array of dates that have been edited/have content
 */
export const HorizontalDayViewer = React.memo(function HorizontalDayViewer({
  onDateSelect,
  selectedDate,
  editedDates = [],
}: HorizontalDayViewerProps) {
  // Custom hooks for calendar functionality
  const {
    dayItems,
    initializeCalendar,
    extendToEnd,
    extendToStart,
    getCurrentMonth,
  } = useCalendarData();

  const {
    flatListRef,
    currentMonth,
    onViewableItemsChanged,
    viewabilityConfig,
    handleDayPress,
    scrollToToday,
    onScrollHandler,
    onEndReached,
    onEndReachedThreshold,
    performInitialScroll,
    onScrollToIndexFailed,
    setMonthDisplay,
  } = useCalendarScroll(onDateSelect, extendToEnd, extendToStart, getCurrentMonth);

  const {
    getDayItemStyles,
    getContainerStyles,
    getTodayButtonStyles,
    getMonthTextStyles,
  } = useCalendarTheme(selectedDate, editedDates);

  // Initialize calendar data
  useEffect(() => {
    initializeCalendar();
    setMonthDisplay(format(new Date(), "MMM yyyy"));
  }, [initializeCalendar, setMonthDisplay]);

  // Perform initial scroll to today
  useEffect(() => {
    performInitialScroll(dayItems.length);
  }, [dayItems.length, performInitialScroll]);

  if (dayItems.length === 0) {
    return null;
  }

  return (
    <CalendarErrorBoundary>
      <View style={[styles.container, getContainerStyles()]}>
        <CalendarHeader
          currentMonth={currentMonth}
          onTodayPress={scrollToToday}
          monthTextStyle={getMonthTextStyles()}
          todayButtonStyle={getTodayButtonStyles()}
        />
        <CalendarList
          ref={flatListRef}
          data={dayItems}
          onDayPress={handleDayPress}
          getDayItemStyles={getDayItemStyles}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          onScroll={onScrollHandler}
          onScrollToIndexFailed={onScrollToIndexFailed}
        />
      </View>
    </CalendarErrorBoundary>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: UI_CONSTANTS.CONTAINER_PADDING,
    paddingBottom: UI_CONSTANTS.CONTAINER_PADDING,
    borderBottomWidth: 1,
  },
});
