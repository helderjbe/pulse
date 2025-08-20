import { useEffect, useRef, useState } from 'react';
import { noteOperations } from '@/lib/database';
import { handleComponentError, safeAsyncOperation } from '@/utils/errorHandling';
import type { EditorBridge } from '@10play/tentap-editor';

interface UseNoteContentProps {
  selectedDate: string;
  isDatabaseReady: boolean;
  editor: EditorBridge;
}

interface UseNoteContentReturn {
  isLoading: boolean;
  currentContent: string;
}

export function useNoteContent({
  selectedDate,
  isDatabaseReady,
  editor,
}: UseNoteContentProps): UseNoteContentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const isLoadingContentRef = useRef(false);

  useEffect(() => {
    const loadNote = async () => {
      if (!selectedDate || !isDatabaseReady || isLoadingContentRef.current) {
        return;
      }

      setIsLoading(true);
      isLoadingContentRef.current = true;

      const { data: note, error } = await safeAsyncOperation(
        () => noteOperations.getNote(selectedDate),
        'load note'
      );

      if (error) {
        handleComponentError('useNoteContent', error, 'loading note content');
        setCurrentContent('');
      } else {
        const content = note?.text || '';
        setCurrentContent(content);
        
        // Only update editor if content is different to avoid unnecessary rerenders
        if (content !== currentContent) {
          editor.setContent(content);
        }
      }

      setIsLoading(false);
      isLoadingContentRef.current = false;
    };

    loadNote();
  }, [selectedDate, isDatabaseReady, editor, currentContent]);

  return {
    isLoading,
    currentContent,
  };
}