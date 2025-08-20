import { useThemeColor } from "@/hooks/useThemeColor";
import type { ChatMessage as ChatMessageType } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  
  const isUser = message.role === 'user';
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.assistantMessage
    ]}>
      <View style={[
        styles.bubble,
        {
          backgroundColor: isUser ? tintColor : backgroundColor,
          borderColor: isUser ? 'transparent' : textColor + '20',
        }
      ]}>
        <Text style={[
          styles.messageText,
          {
            color: isUser ? '#FFFFFF' : textColor,
          }
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.timestamp,
          {
            color: isUser ? '#FFFFFF80' : textColor + '60',
          }
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});