import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MAX_MESSAGE_LENGTH = 500;

export const ChatInput = React.memo(({ onSendMessage, isLoading, disabled = false }: ChatInputProps) => {
  const [inputText, setInputText] = useState("");
  
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "chatBorder");
  const inputBackgroundColor = useThemeColor({}, "chatInputBackground");
  const inputBorderColor = useThemeColor({}, "chatInputBorder");

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = inputText.trim();
    if (!trimmedMessage || isLoading || disabled) return;
    
    onSendMessage(trimmedMessage);
    setInputText("");
  }, [inputText, isLoading, disabled, onSendMessage]);

  const canSend = inputText.trim() && !isLoading && !disabled;
  const remainingChars = MAX_MESSAGE_LENGTH - inputText.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <View style={[styles.inputContainer, { borderTopColor: borderColor }]}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: inputBackgroundColor,
              borderColor: inputBorderColor,
              color: textColor,
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your notes..."
          placeholderTextColor={textColor + '60'}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          editable={!isLoading && !disabled}
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
          accessibilityRole="text"
          accessibilityLabel="Message input"
          accessibilityHint={`Enter your message here. ${remainingChars} characters remaining.`}
          accessibilityState={{ disabled: isLoading || disabled }}
        />
        {isNearLimit && (
          <Text 
            style={[styles.charCounter, { color: remainingChars <= 0 ? '#dc2626' : textColor + '60' }]}
            accessibilityLiveRegion="polite"
          >
            {remainingChars}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={handleSendMessage}
        disabled={!canSend}
        style={[
          styles.sendButton,
          {
            backgroundColor: canSend ? tintColor : textColor + '30',
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityHint="Sends your message to the AI assistant"
        accessibilityState={{ disabled: !canSend }}
      >
        <Text style={styles.sendButtonText}>
          {isLoading ? '⋯' : '→'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

ChatInput.displayName = "ChatInput";

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});