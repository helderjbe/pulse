import { useCallback, useEffect } from 'react';
import { updateNoteEmbedding, generateMissingEmbeddings } from '@/services/embeddingService';
import { noteOperations } from '@/lib/database';

interface UseEmbeddingsProps {
  isDatabaseReady: boolean;
}

interface UseEmbeddingsReturn {
  updateEmbeddingForNote: (day: string, content: string) => Promise<void>;
  generateAllMissingEmbeddings: () => Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }>;
}

export function useEmbeddings({ isDatabaseReady }: UseEmbeddingsProps): UseEmbeddingsReturn {
  const updateEmbeddingForNote = useCallback(async (day: string, content: string) => {
    if (!isDatabaseReady) return;

    try {
      // Get the note to find its ID
      const note = await noteOperations.getNote(day);
      if (note) {
        await updateNoteEmbedding(note.id, content);
      }
    } catch (error) {
      console.error('Failed to update embedding for note:', error);
      // Don't throw - this is a background enhancement that shouldn't break the main flow
    }
  }, [isDatabaseReady]);

  const generateAllMissingEmbeddings = useCallback(async () => {
    if (!isDatabaseReady) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    try {
      return await generateMissingEmbeddings();
    } catch (error) {
      console.error('Failed to generate missing embeddings:', error);
      return { processed: 0, succeeded: 0, failed: 0 };
    }
  }, [isDatabaseReady]);

  // Generate missing embeddings on app start (run once when database is ready)
  useEffect(() => {
    if (isDatabaseReady) {
      // Run this in background, don't await
      generateAllMissingEmbeddings().then(result => {
        if (result.processed > 0) {
          console.log(`Generated embeddings: ${result.succeeded}/${result.processed} succeeded`);
        }
      });
    }
  }, [isDatabaseReady, generateAllMissingEmbeddings]);

  return {
    updateEmbeddingForNote,
    generateAllMissingEmbeddings,
  };
}