import { useThemeColor } from "@/hooks/useThemeColor";
import type { ChatFABProps } from "@/types";
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export function ChatFAB({ onPress }: ChatFABProps) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.fab,
        {
          bottom: insets.bottom + 20,
          right: 20,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            },
            android: {
              elevation: 6,
            },
          }),
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name="sparkles" 
          size={22} 
          color="white" 
        />
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});