import { CALENDAR_CONSTANTS, UI_CONSTANTS } from "@/constants/AppConstants";
import type { DayItem } from "@/types";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { FlatList, ViewToken } from "react-native";

const { TODAY_INDEX_OFFSET: TODAY_INDEX, VIEWABILITY_THRESHOLD, END_THRESHOLD } = CALENDAR_CONSTANTS;
const { DAY_ITEM_WIDTH } = UI_CONSTANTS;

/**
 * Custom hook for managing calendar scroll behavior and interactions
 */
export function useCalendarScroll(
  onDateSelect: (dateString: string) => void,
  extendToEnd: () => void,
  extendToStart: () => void,
  getCurrentMonth: (date: Date) => string
) {
  const flatListRef = useRef<FlatList<DayItem>>(null);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  /**
   * Updates the displayed month when scrolling
   */
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
        if (centerItem?.item) {
          const monthYear = getCurrentMonth((centerItem.item as DayItem).date);
          setCurrentMonth(monthYear);
        }
      }
    },
    [getCurrentMonth]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: VIEWABILITY_THRESHOLD,
  };

  /**
   * Handles day selection with haptic feedback
   */
  const handleDayPress = useCallback(
    (item: DayItem) => {
      Haptics.selectionAsync();
      onDateSelect(item.dateString);
    },
    [onDateSelect]
  );

  /**
   * Scrolls to today's date and selects it
   */
  const scrollToToday = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flatListRef.current?.scrollToIndex({
      index: TODAY_INDEX,
      animated: true,
      viewPosition: 0,
    });
    const today = format(new Date(), "yyyy-MM-dd");
    onDateSelect(today);
  }, [onDateSelect]);

  /**
   * Throttled scroll handler to prevent excessive onStartReached calls
   */
  const onScrollHandler = useCallback(
    (event: any) => {
      const { contentOffset } = event.nativeEvent;
      if (contentOffset.x <= DAY_ITEM_WIDTH * 5) {
        extendToStart();
      }
    },
    [extendToStart]
  );

  /**
   * Performs initial scroll to today when component mounts
   */
  const performInitialScroll = useCallback((dayItemsLength: number) => {
    if (dayItemsLength > 0 && !initialScrollDone) {
      // Use requestAnimationFrame to ensure FlatList is fully rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: TODAY_INDEX,
            animated: false,
            viewPosition: 0,
          });
          setInitialScrollDone(true);
        }, 300);
      });
    }
  }, [initialScrollDone]);

  /**
   * Handles scroll to index failures with fallback
   */
  const onScrollToIndexFailed = useCallback((info: { index: number }) => {
    // Fallback to scrollTo if scrollToIndex fails
    const offset = info.index * (DAY_ITEM_WIDTH + 4);
    flatListRef.current?.scrollToOffset({
      offset,
      animated: false,
    });
  }, []);

  /**
   * Sets the current month display
   */
  const setMonthDisplay = useCallback((month: string) => {
    setCurrentMonth(month);
  }, []);

  return {
    flatListRef,
    currentMonth,
    initialScrollDone,
    onViewableItemsChanged,
    viewabilityConfig,
    handleDayPress,
    scrollToToday,
    onScrollHandler,
    onEndReached: extendToEnd,
    onEndReachedThreshold: END_THRESHOLD,
    performInitialScroll,
    onScrollToIndexFailed,
    setMonthDisplay,
  };
}