import { sendChatMessage, isOpenAIConfigured } from "@/services/openaiService";
import type { ChatMessage } from "@/types";
import { useState, useCallback } from "react";

interface UseChatProps {
  currentNoteContent: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  isConfigured: boolean;
}

export function useChat({ currentNoteContent }: UseChatProps): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Clear previous error
    setError(null);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare chat history for context (exclude current user message)
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      // Send to OpenAI
      const response = await sendChatMessage(content.trim(), currentNoteContent, chatHistory);

      if (response.error) {
        throw new Error(response.error);
      }

      // Add AI response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message as system response
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentNoteContent, messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    isConfigured: isOpenAIConfigured(),
  };
}