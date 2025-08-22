import OpenAI from 'openai';
import { findSimilarNotes } from './embeddingService';
import { format } from 'date-fns';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

/**
 * Determine if a query would benefit from semantic search across notes
 */
function shouldUseSemanticSearch(userMessage: string): boolean {
  const semanticKeywords = [
    'find', 'search', 'look', 'remember', 'recall', 'mentioned', 'wrote', 'noted',
    'what did i', 'when did i', 'where did i', 'have i', 'did i write',
    'similar', 'related', 'about', 'regarding', 'concerning',
    'previous', 'past', 'earlier', 'before', 'history', 'all my',
    'compare', 'contrast', 'difference', 'summary', 'summarize'
  ];

  const lowerMessage = userMessage.toLowerCase();
  return semanticKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Send a chat message to OpenAI with enhanced note context
 * @param userMessage - The user's question/message
 * @param currentNoteContent - Current note content for context  
 * @param currentDay - Current selected day (YYYY-MM-DD format)
 * @param chatHistory - Previous chat messages for context
 * @returns Promise with AI response
 */
export async function sendChatMessage(
  userMessage: string,
  currentNoteContent: string = '',
  currentDay: string = '',
  chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // Validate API key
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let contextMessage = '';

    // Check if we should use semantic search
    if (shouldUseSemanticSearch(userMessage)) {
      try {
        const similarNotes = await findSimilarNotes(userMessage, 4);
        
        if (similarNotes.length > 0) {
          contextMessage = `Here are relevant notes from your journal that might help answer your question:\n\n`;
          
          similarNotes.forEach((result, index) => {
            const noteDate = format(new Date(result.note.day), 'MMMM dd, yyyy');
            const noteText = result.note.text
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 200);
            
            contextMessage += `${index + 1}. ${noteDate} (relevance: ${Math.round(result.similarity * 100)}%):\n${noteText}${noteText.length >= 200 ? '...' : ''}\n\n`;
          });
        }
      } catch (error) {
        console.error('Semantic search failed, falling back to current note only:', error);
      }
    }

    // Always include current note content
    const todayDate = currentDay ? format(new Date(currentDay), 'MMMM dd, yyyy') : 'today';
    contextMessage += `Current note content for ${todayDate}:\n${currentNoteContent || 'No content yet.'}`;

    // Build enhanced system message
    const systemMessage = `You are a helpful AI assistant that answers questions about the user's personal notes and journal entries. 

${contextMessage}

Please help the user understand, analyze, or get insights about their notes. Be concise and helpful. When referencing specific notes, mention the date for context. If asked about trends or patterns, look across the provided notes to give comprehensive insights.`;

    // Build messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API with higher token limit for more comprehensive responses
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    return {
      message: assistantMessage,
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      return {
        message: '',
        error: error.message,
      };
    }
    
    return {
      message: '',
      error: 'Failed to get AI response. Please try again.',
    };
  }
}

/**
 * Validate OpenAI service configuration
 * @returns boolean indicating if service is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
}