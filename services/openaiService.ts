import OpenAI from 'openai';

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
 * Send a chat message to OpenAI with note context
 * @param userMessage - The user's question/message
 * @param noteContent - Current note content for context
 * @param chatHistory - Previous chat messages for context
 * @returns Promise with AI response
 */
export async function sendChatMessage(
  userMessage: string,
  noteContent: string = '',
  chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // Validate API key
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Build context message
    const systemMessage = `You are a helpful AI assistant that answers questions about the user's notes. 
    
Current note content for today:
${noteContent || 'No content for today yet.'}

Please help the user understand, analyze, or get insights about their notes. Be concise and helpful.`;

    // Build messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
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