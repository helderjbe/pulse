import { UI_CONSTANTS } from "@/constants/AppConstants";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CalendarHeaderProps {
  currentMonth: string;
  onTodayPress: () => void;
  monthTextStyle: { color: string };
  todayButtonStyle: { borderColor: string; textColor: string };
}

/**
 * Calendar header component showing the current month and Today button
 */
export const CalendarHeader = React.memo(function CalendarHeader({
  currentMonth,
  onTodayPress,
  monthTextStyle,
  todayButtonStyle,
}: CalendarHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Text 
        style={[styles.monthText, monthTextStyle]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`Current month: ${currentMonth}`}
      >
        {currentMonth}
      </Text>
      <TouchableOpacity
        style={[styles.todayButton, { borderColor: todayButtonStyle.borderColor }]}
        onPress={onTodayPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go to today"
        accessibilityHint="Double tap to scroll to today's date"
      >
        <Text style={[styles.todayButtonText, { color: todayButtonStyle.textColor }]}>
          Today
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: UI_CONSTANTS.HEADER_PADDING,
    paddingBottom: UI_CONSTANTS.HEADER_BOTTOM_PADDING,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: UI_CONSTANTS.TODAY_BUTTON_PADDING,
    borderRadius: UI_CONSTANTS.TODAY_BUTTON_BORDER_RADIUS,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

CalendarHeader.displayName = "CalendarHeader";