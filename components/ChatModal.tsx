import { useThemeColor } from "@/hooks/useThemeColor";
import { useChat } from "@/hooks/useChat";
import type { ChatModalProps } from "@/types";
import React, { useRef, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatMessage } from "@/components/ui/ChatMessage";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatInput } from "@/components/ui/ChatInput";
import { ChatError } from "@/components/ui/ChatError";

export const ChatModal = React.memo(({ visible, onClose, currentNoteContent, currentDay }: ChatModalProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const loadingTextColor = useThemeColor({}, "chatLoadingText");
  
  const { messages, isLoading, error, sendMessage, clearChat, isConfigured } = useChat({
    currentNoteContent,
    currentDay,
  });

  const handleSendMessage = useCallback(async (messageText: string) => {
    await sendMessage(messageText);
    
    // Scroll to bottom after message is sent
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [sendMessage]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClearChat = useCallback(() => {
    clearChat();
  }, [clearChat]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (!isConfigured) {
    return (
      <Modal 
        visible={visible} 
        animationType="slide" 
        presentationStyle="fullScreen"
        accessibilityViewIsModal
      >
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
          <ChatHeader 
            onClose={handleClose}
            onClear={handleClearChat}
            hasMessages={false}
          />
          <View style={styles.centeredContent}>
            <Text 
              style={[styles.errorText, { color: textColor }]}
              accessibilityRole="text"
              accessibilityLiveRegion="polite"
            >
              OpenAI API key not configured.{'\n'}
              Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
      accessibilityViewIsModal
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ChatHeader 
            onClose={handleClose}
            onClear={handleClearChat}
            hasMessages={messages.length > 0}
          />

          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            accessibilityRole="scrollbar"
            accessibilityLabel="Chat messages"
          >
            {error && (
              <ChatError 
                error={error}
                onDismiss={() => {/* Error is handled by useChat hook */}}
              />
            )}
            
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text 
                  style={[styles.emptyStateText, { color: loadingTextColor }]}
                  accessibilityRole="text"
                >
                  Ask me anything about your notes!
                </Text>
              </View>
            ) : (
              messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            {isLoading && (
              <View 
                style={styles.loadingContainer}
                accessibilityRole="text"
                accessibilityLabel="AI is thinking"
                accessibilityLiveRegion="polite"
              >
                <ActivityIndicator size="small" color={tintColor} />
                <Text style={[styles.loadingText, { color: loadingTextColor }]}>
                  Thinking...
                </Text>
              </View>
            )}
          </ScrollView>

          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!isConfigured}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

ChatModal.displayName = "ChatModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
});