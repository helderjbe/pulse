import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatHeaderProps {
  onClose: () => void;
  onClear: () => void;
  hasMessages: boolean;
}

export const ChatHeader = React.memo(({ onClose, onClear, hasMessages }: ChatHeaderProps) => {
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "chatBorder");

  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <Text style={[styles.title, { color: textColor }]}>AI Chat</Text>
      <View style={styles.headerButtons}>
        {hasMessages && (
          <TouchableOpacity 
            onPress={onClear} 
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear chat history"
            accessibilityHint="Removes all messages from the current chat session"
          >
            <Text style={[styles.clearButtonText, { color: tintColor }]}>Clear</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={onClose} 
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close chat"
          accessibilityHint="Closes the chat modal and returns to the main screen"
        >
          <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

ChatHeader.displayName = "ChatHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
});