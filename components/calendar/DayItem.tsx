import { UI_CONSTANTS } from "@/constants/AppConstants";
import type { DayItem as DayItemType } from "@/types";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface DayItemProps {
  item: DayItemType;
  onPress: (item: DayItemType) => void;
  style: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    borderWidth: number;
    fontWeight?: string;
    fontSize?: number;
  };
}

/**
 * Individual day item component for the calendar
 */
export const DayItem = React.memo(function DayItem({
  item,
  onPress,
  style,
}: DayItemProps) {
  const handlePress = () => onPress(item);

  const accessibilityLabel = `${format(item.date, "EEEE, MMMM d, yyyy")}`;
  const accessibilityHint = "Double tap to select this date";

  return (
    <TouchableOpacity
      style={[
        styles.dayItem,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.dayText, { color: style.textColor }]}>
        {format(item.date, "EEE")}
      </Text>
      <Text style={[
        styles.dateText, 
        { 
          color: style.textColor,
          fontWeight: style.fontWeight || styles.dateText.fontWeight,
          fontSize: style.fontSize || styles.dateText.fontSize,
        }
      ]}>
        {format(item.date, "d")}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  dayItem: {
    width: UI_CONSTANTS.DAY_ITEM_WIDTH,
    height: UI_CONSTANTS.DAY_ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: UI_CONSTANTS.DAY_ITEM_MARGIN,
    borderRadius: UI_CONSTANTS.DAY_ITEM_BORDER_RADIUS,
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

DayItem.displayName = "DayItem";