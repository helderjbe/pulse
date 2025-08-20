import { useThemeColor } from "@/hooks/useThemeColor";
import { useChat } from "@/hooks/useChat";
import type { ChatModalProps } from "@/types";
import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatMessage } from "@/components/ui/ChatMessage";

export function ChatModal({ visible, onClose, currentNoteContent }: ChatModalProps) {
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  
  const { messages, isLoading, sendMessage, clearChat, isConfigured } = useChat({
    currentNoteContent,
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const messageToSend = inputText.trim();
    setInputText("");
    
    await sendMessage(messageToSend);
    
    // Scroll to bottom after message is sent
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleClose = () => {
    setInputText("");
    onClose();
  };

  if (!isConfigured) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>AI Chat</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.centeredContent}>
            <Text style={[styles.errorText, { color: textColor }]}>
              OpenAI API key not configured.{'\n'}
              Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>AI Chat</Text>
            <View style={styles.headerButtons}>
              {messages.length > 0 && (
                <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
                  <Text style={[styles.clearButtonText, { color: tintColor }]}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: textColor + '80' }]}>
                  Ask me anything about your notes!
                </Text>
              </View>
            ) : (
              messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={tintColor} />
                <Text style={[styles.loadingText, { color: textColor + '80' }]}>
                  Thinking...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={[styles.inputContainer, { borderTopColor: textColor + '20' }]}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: backgroundColor,
                  borderColor: textColor + '30',
                  color: textColor,
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about your notes..."
              placeholderTextColor={textColor + '60'}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !isLoading ? tintColor : textColor + '30',
                }
              ]}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? '⋯' : '→'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00000020',
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
  },
  clearButtonText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '500',
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
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
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