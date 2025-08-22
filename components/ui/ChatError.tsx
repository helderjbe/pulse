import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ChatError = React.memo(({ error, onRetry, onDismiss }: ChatErrorProps) => {
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const errorBackgroundColor = useThemeColor({}, "chatErrorBackground");
  const errorTextColor = useThemeColor({}, "chatErrorText");

  return (
    <View 
      style={[styles.container, { backgroundColor: errorBackgroundColor }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.content}>
        <Text style={[styles.errorText, { color: errorTextColor }]}>
          {error}
        </Text>
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity 
              onPress={onRetry}
              style={[styles.button, styles.retryButton, { borderColor: tintColor }]}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              accessibilityHint="Attempts to send the message again"
            >
              <Text style={[styles.buttonText, { color: tintColor }]}>Retry</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity 
              onPress={onDismiss}
              style={[styles.button, styles.dismissButton]}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
              accessibilityHint="Closes this error message"
            >
              <Text style={[styles.buttonText, { color: textColor }]}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

ChatError.displayName = "ChatError";

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 44,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    borderWidth: 1,
  },
  dismissButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});