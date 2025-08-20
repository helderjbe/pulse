import { useThemeColor } from "@/hooks/useThemeColor";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DateDisplayProps {
  selectedDate: string;
}

export function DateDisplay({ selectedDate }: DateDisplayProps) {
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "calendarTextSecondary");

  const date = parseISO(selectedDate);

  // Format the ordinal date (1st, 2nd, 3rd, etc.)
  const getOrdinalDate = (date: Date): string => {
    const day = format(date, "d");
    const lastDigit = parseInt(day) % 10;
    const lastTwoDigits = parseInt(day) % 100;

    let suffix = "th";
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      switch (lastDigit) {
        case 1:
          suffix = "st";
          break;
        case 2:
          suffix = "nd";
          break;
        case 3:
          suffix = "rd";
          break;
      }
    }

    return `${day}${suffix}`;
  };

  // Get the day label (Today, Yesterday, Tomorrow, or day name)
  const getDayLabel = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE"); // Full day name
  };

  const dayLabel = getDayLabel(date);
  const dayOfWeek = format(date, "EEE"); // Short day name (Mon, Tue, etc.)
  const ordinalDate = getOrdinalDate(date);
  const monthYear = format(date, "MMM yyyy");

  // Only show day of week if it's not Today/Yesterday/Tomorrow
  const showDayOfWeek = !["Today", "Yesterday", "Tomorrow"].includes(dayLabel);

  return (
    <View style={styles.container}>
      <Text style={[styles.dateText, { color: textColor }]}>
        {dayLabel}
        {showDayOfWeek && (
          <Text style={{ color: secondaryTextColor }}>, {dayOfWeek}</Text>
        )}
        <Text style={{ color: secondaryTextColor }}>
          , {ordinalDate} {monthYear}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
