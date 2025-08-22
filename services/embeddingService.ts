import OpenAI from 'openai';
import { embeddingOperations, noteOperations, Note } from '@/lib/database';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface EmbeddingResult {
  success: boolean;
  error?: string;
}

/**
 * Generate embedding for text using OpenAI's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Generate and save embedding for a specific note
 */
export async function generateNoteEmbedding(noteId: number, text: string): Promise<EmbeddingResult> {
  try {
    if (!text || text.trim().length === 0) {
      return { success: true }; // Skip empty notes
    }

    // Strip HTML tags and clean text for embedding
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanText.length === 0) {
      return { success: true }; // Skip notes with only HTML tags
    }

    const embedding = await generateEmbedding(cleanText);
    await embeddingOperations.saveEmbedding(noteId, cleanText, embedding);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to generate embedding for note ${noteId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate embeddings for all notes that don't have them
 */
export async function generateMissingEmbeddings(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  try {
    const allNotes = await noteOperations.getAllNotes();
    const existingEmbeddings = await embeddingOperations.getAllEmbeddings();
    const embeddingNoteIds = new Set(existingEmbeddings.map(e => e.note_id));

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    // Process notes that don't have embeddings
    for (const note of allNotes) {
      if (!embeddingNoteIds.has(note.id) && note.text && note.text.trim().length > 0) {
        processed++;
        const result = await generateNoteEmbedding(note.id, note.text);
        
        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { processed, succeeded, failed };
  } catch (error) {
    console.error('Failed to generate missing embeddings:', error);
    throw error;
  }
}

/**
 * Update embedding for a note when its content changes
 */
export async function updateNoteEmbedding(noteId: number, newText: string): Promise<EmbeddingResult> {
  try {
    // Delete existing embedding if any
    await embeddingOperations.deleteEmbedding(noteId);
    
    // Generate new embedding if text is not empty
    if (newText && newText.trim().length > 0) {
      return await generateNoteEmbedding(noteId, newText);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to update embedding for note ${noteId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Find semantically similar notes to a query
 */
export async function findSimilarNotes(query: string, limit: number = 5) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Find similar notes using cosine similarity
    const similarNotes = await embeddingOperations.findSimilarNotes(queryEmbedding, limit);
    
    // Filter out very low similarity scores (below 0.3)
    return similarNotes.filter(result => result.similarity > 0.3);
  } catch (error) {
    console.error('Failed to find similar notes:', error);
    throw error;
  }
}

/**
 * Check if embedding service is properly configured
 */
export function isEmbeddingServiceConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
}