import { CALENDAR_CONSTANTS, UI_CONSTANTS } from "@/constants/AppConstants";
import type { DayItem as DayItemType } from "@/types";
import React, { forwardRef } from "react";
import { Dimensions, FlatList, StyleSheet } from "react-native";
import { DayItem } from "./DayItem";

const SCREEN_WIDTH = Dimensions.get("window").width;
const { DAY_ITEM_WIDTH } = UI_CONSTANTS;
const { INITIAL_RENDER_COUNT, MAX_RENDER_BATCH, WINDOW_SIZE } = CALENDAR_CONSTANTS;

interface CalendarListProps {
  data: DayItemType[];
  onDayPress: (item: DayItemType) => void;
  getDayItemStyles: (item: DayItemType) => {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    borderWidth: number;
    fontWeight?: string;
    fontSize?: number;
  };
  onViewableItemsChanged: ({ viewableItems }: { viewableItems: any[] }) => void;
  viewabilityConfig: { itemVisiblePercentThreshold: number };
  onEndReached: () => void;
  onEndReachedThreshold: number;
  onScroll: (event: any) => void;
  onScrollToIndexFailed: (info: { index: number }) => void;
}

/**
 * Optimized FlatList component for rendering calendar days
 */
export const CalendarList = forwardRef<FlatList<DayItemType>, CalendarListProps>(
  function CalendarList(
    {
      data,
      onDayPress,
      getDayItemStyles,
      onViewableItemsChanged,
      viewabilityConfig,
      onEndReached,
      onEndReachedThreshold,
      onScroll,
      onScrollToIndexFailed,
    },
    ref
  ) {
    const renderDayItem = ({ item }: { item: DayItemType }) => {
      const itemStyles = getDayItemStyles(item);
      return <DayItem item={item} onPress={onDayPress} style={itemStyles} />;
    };

    const keyExtractor = (item: DayItemType) => item.dateString;

    const getItemLayout = (_: any, index: number) => ({
      length: DAY_ITEM_WIDTH + 4, // Include horizontal margins
      offset: (DAY_ITEM_WIDTH + 4) * index,
      index,
    });

    return (
      <FlatList
        ref={ref}
        data={data}
        renderItem={renderDayItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={DAY_ITEM_WIDTH + 4}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onScroll={onScroll}
        getItemLayout={getItemLayout}
        initialNumToRender={INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={MAX_RENDER_BATCH}
        windowSize={WINDOW_SIZE}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    );
  }
);

const styles = StyleSheet.create({
  flatListContent: {
    paddingHorizontal: (SCREEN_WIDTH - DAY_ITEM_WIDTH - 4) / 2,
  },
});

CalendarList.displayName = "CalendarList";