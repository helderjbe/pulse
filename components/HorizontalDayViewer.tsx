import { useThemeColor } from "@/hooks/useThemeColor";
import { addDays, format, isSameDay, isToday, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DAY_ITEM_WIDTH = 60;
const INITIAL_DAYS_COUNT = 365; // Generate �365 days initially
const TODAY_INDEX = INITIAL_DAYS_COUNT; // Today is in the middle

interface HorizontalDayViewerProps {
  onDateSelect: (dateString: string) => void;
  selectedDate: string;
  editedDates?: string[]; // For future TODO integration
}

interface DayItem {
  date: Date;
  dateString: string;
  index: number;
}

export function HorizontalDayViewer({
  onDateSelect,
  selectedDate,
  editedDates = [],
}: HorizontalDayViewerProps) {
  const flatListRef = useRef<FlatList<DayItem>>(null);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [dayItems, setDayItems] = useState<DayItem[]>([]);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "calendarBackground");
  const borderColor = useThemeColor({}, "calendarBorder");
  const todayColor = useThemeColor({}, "calendarToday");
  const selectedColor = useThemeColor({}, "calendarSelected");
  const textColor = useThemeColor({}, "calendarText");
  const editedColor = "#ff6b35"; // Orange for edited dates

  // Generate initial day items
  useEffect(() => {
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

    setDayItems(items);
    setCurrentMonth(format(today, "MMM yyyy"));
  }, []);

  // Scroll to today on initial load
  useEffect(() => {
    if (dayItems.length > 0 && !initialScrollDone) {
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
  }, [dayItems, initialScrollDone]);

  // Update current month when scrolling
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
        if (centerItem?.item) {
          const monthYear = format(
            (centerItem.item as DayItem).date,
            "MMM yyyy"
          );
          setCurrentMonth(monthYear);
        }
      }
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Handle day selection
  const handleDayPress = useCallback(
    (item: DayItem) => {
      Haptics.selectionAsync();
      onDateSelect(item.dateString);
    },
    [onDateSelect]
  );

  // Scroll to today
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

  // Extend data when reaching ends
  const onEndReached = useCallback(() => {
    const lastItem = dayItems[dayItems.length - 1];
    if (lastItem) {
      const newItems: DayItem[] = [];
      for (let i = 1; i <= 30; i++) {
        const date = addDays(lastItem.date, i);
        newItems.push({
          date,
          dateString: format(date, "yyyy-MM-dd"),
          index: lastItem.index + i,
        });
      }
      setDayItems((prev) => [...prev, ...newItems]);
    }
  }, [dayItems]);

  const onStartReached = useCallback(() => {
    const firstItem = dayItems[0];
    if (firstItem) {
      const newItems: DayItem[] = [];
      for (let i = 30; i >= 1; i--) {
        const date = addDays(firstItem.date, -i);
        newItems.push({
          date,
          dateString: format(date, "yyyy-MM-dd"),
          index: firstItem.index - i,
        });
      }
      setDayItems((prev) => [...newItems, ...prev]);
    }
  }, [dayItems]);

  // Render individual day item
  const renderDayItem = ({ item }: { item: DayItem }) => {
    const isSelectedDay = isSameDay(parseISO(selectedDate), item.date);
    const isTodayDay = isToday(item.date);
    const isEditedDay = editedDates.includes(item.dateString);

    // Determine background color based on state priority
    let itemBackgroundColor = "transparent";
    let itemBorderColor = "transparent";
    let itemTextColor = textColor;

    if (isTodayDay) {
      itemBackgroundColor = todayColor;
      itemTextColor = "#ffffff";
      itemBorderColor = todayColor;
    } else if (isSelectedDay) {
      itemBackgroundColor = selectedColor;
      itemTextColor = "#ffffff";
      itemBorderColor = selectedColor;
    } else if (isEditedDay) {
      itemBorderColor = editedColor;
      itemTextColor = editedColor;
    }

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          {
            backgroundColor: itemBackgroundColor,
            borderColor: itemBorderColor,
            borderWidth: itemBorderColor !== "transparent" ? 2 : 0,
          },
        ]}
        onPress={() => handleDayPress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dayText, { color: itemTextColor }]}>
          {format(item.date, "EEE")}
        </Text>
        <Text style={[styles.dateText, { color: itemTextColor }]}>
          {format(item.date, "d")}
        </Text>
      </TouchableOpacity>
    );
  };

  if (dayItems.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderBottomColor: borderColor },
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.monthText, { color: textColor }]}>
          {currentMonth}
        </Text>
        <TouchableOpacity
          style={[styles.todayButton, { borderColor: todayColor }]}
          onPress={scrollToToday}
          activeOpacity={0.7}
        >
          <Text style={[styles.todayButtonText, { color: todayColor }]}>
            Today
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Picker */}
      <FlatList
        ref={flatListRef}
        data={dayItems}
        renderItem={renderDayItem}
        keyExtractor={(item) => item.dateString}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={DAY_ITEM_WIDTH + 4}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        // Note: onStartReached is not a built-in prop, we'll handle it differently
        onScroll={(event) => {
          const { contentOffset } = event.nativeEvent;
          if (contentOffset.x <= DAY_ITEM_WIDTH * 5) {
            onStartReached();
          }
        }}
        getItemLayout={(_, index) => ({
          length: DAY_ITEM_WIDTH + 4, // Include horizontal margins
          offset: (DAY_ITEM_WIDTH + 4) * index,
          index,
        })}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={21}
        onScrollToIndexFailed={(info) => {
          // Fallback to scrollTo if scrollToIndex fails
          const offset = info.index * (DAY_ITEM_WIDTH + 4);
          flatListRef.current?.scrollToOffset({
            offset,
            animated: false,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  flatListContent: {
    paddingHorizontal: (SCREEN_WIDTH - DAY_ITEM_WIDTH - 4) / 2,
  },
  dayItem: {
    width: DAY_ITEM_WIDTH,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    borderRadius: 12,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
