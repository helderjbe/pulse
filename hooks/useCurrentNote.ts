import { useState, useEffect } from 'react';
import { noteOperations } from '@/lib/database';
import { handleComponentError, safeAsyncOperation } from '@/utils/errorHandling';

interface UseCurrentNoteProps {
  selectedDate: string;
  isDatabaseReady: boolean;
}

interface UseCurrentNoteReturn {
  currentContent: string;
  isLoading: boolean;
}

export function useCurrentNote({ selectedDate, isDatabaseReady }: UseCurrentNoteProps): UseCurrentNoteReturn {
  const [currentContent, setCurrentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      if (!selectedDate || !isDatabaseReady) {
        setCurrentContent('');
        return;
      }

      setIsLoading(true);

      const { data: note, error } = await safeAsyncOperation(
        () => noteOperations.getNote(selectedDate),
        'load note for chat'
      );

      if (error) {
        handleComponentError('useCurrentNote', error, 'loading note content for chat');
        setCurrentContent('');
      } else {
        setCurrentContent(note?.text || '');
      }

      setIsLoading(false);
    };

    loadNote();
  }, [selectedDate, isDatabaseReady]);

  return {
    currentContent,
    isLoading,
  };
}