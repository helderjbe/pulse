import { useThemeColor } from "@/hooks/useThemeColor";
import { addDays, format, startOfToday } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const ITEM_WIDTH = 70;
const ITEM_SPACING = 10;

interface DateItem {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isFirstOfMonth: boolean;
  monthLabel: string;
}

interface CalendarProps {
  onDateSelect: (dateString: string) => void;
  selectedDate?: string;
}

export function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [dates, setDates] = useState<DateItem[]>([]);
  const [isTodayVisible, setIsTodayVisible] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const todayIndexRef = useRef<number>(90);

  const backgroundColor = useThemeColor({}, "calendarBackground");
  const borderColor = useThemeColor({}, "calendarBorder");
  const todayColor = useThemeColor({}, "calendarToday");
  const selectedColor = useThemeColor({}, "calendarSelected");
  const textColor = useThemeColor({}, "calendarText");
  const secondaryTextColor = useThemeColor({}, "calendarTextSecondary");

  useEffect(() => {
    generateDates();
  }, []);

  const generateDates = () => {
    const today = startOfToday();
    const dateArray: DateItem[] = [];
    let todayIndex = 0;

    for (let i = -90; i <= 90; i++) {
      const date = addDays(today, i);

      const dateString = format(date, "yyyy-MM-dd");
      const dayName = format(date, "EEE");
      const dayNumber = parseInt(format(date, "d"));
      const isToday = i === 0;
      const isFirstOfMonth = parseInt(format(date, "d")) === 1;
      const monthLabel = format(date, "MMM");

      if (isToday) {
        todayIndex = dateArray.length;
      }

      dateArray.push({
        date,
        dateString,
        dayName,
        dayNumber,
        isToday,
        isFirstOfMonth,
        monthLabel,
      });
    }

    setDates(dateArray);
    todayIndexRef.current = todayIndex;

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: todayIndex,
        viewPosition: 0,
        viewOffset: screenWidth / 2 - ITEM_WIDTH / 2,
        animated: true,
      });
    }, 100);
  };

  const handleDatePress = (dateString: string) => {
    onDateSelect(dateString);
  };

  const scrollToToday = () => {
    flatListRef.current?.scrollToIndex({
      index: todayIndexRef.current,
      viewPosition: 0,
      viewOffset: screenWidth / 2 - ITEM_WIDTH / 2,
      animated: true,
    });
  };

  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    const todayIsVisible = viewableItems.some(
      (item: any) => dates[item.index]?.isToday
    );
    setIsTodayVisible(todayIsVisible);
  };

  const renderDateItem = ({ item }: { item: DateItem }) => {
    const isSelected = selectedDate === item.dateString;

    return (
      <TouchableOpacity
        onPress={() => handleDatePress(item.dateString)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.dateItem,
            { backgroundColor, borderColor },
            item.isToday && { borderColor: todayColor, borderWidth: 2 },
            isSelected && { backgroundColor: selectedColor },
          ]}
        >
          <Text
            style={[
              styles.monthText,
              {
                color: isSelected
                  ? "rgba(255,255,255,0.6)"
                  : secondaryTextColor,
              },
            ]}
          >
            {item.monthLabel}
          </Text>
          <Text
            style={[
              styles.dayName,
              { color: isSelected ? "#fff" : secondaryTextColor },
            ]}
          >
            {item.dayName}
          </Text>
          <Text
            style={[
              styles.dayNumber,
              { color: isSelected ? "#fff" : textColor },
              item.isToday &&
                !isSelected && { color: todayColor, fontWeight: "bold" },
            ]}
          >
            {item.dayNumber}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={(item) => item.dateString}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: (ITEM_WIDTH + ITEM_SPACING) * index,
          index,
        })}
        initialScrollIndex={90}
        onScrollToIndexFailed={() => {}}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      <View style={styles.buttonRow}>
        {!isTodayVisible && (
          <TouchableOpacity
            onPress={scrollToToday}
            style={[styles.todayButton, { backgroundColor: todayColor }]}
            activeOpacity={0.8}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginVertical: 10,
  },
  listContainer: {
    paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2,
  },
  monthText: {
    fontSize: 9,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    opacity: 0.6,
    marginBottom: 1,
  },
  dateItem: {
    width: ITEM_WIDTH,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 1,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: "600",
  },
  buttonRow: {
    height: 40,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  todayButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
