import { useThemeColor } from "@/hooks/useThemeColor";
import type { ChatFABProps } from "@/types";
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ChatFAB({ onPress }: ChatFABProps) {
  const tintColor = useThemeColor({}, "tint");
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.fab,
        {
          backgroundColor: tintColor,
          bottom: insets.bottom + 20,
          right: 20,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💬</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    textAlign: 'center',
  },
});