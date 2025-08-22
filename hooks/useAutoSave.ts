import { useCallback, useRef, useState } from 'react';
import { EDITOR_CONSTANTS } from '@/constants/AppConstants';
import { noteOperations } from '@/lib/database';
import { handleComponentError, safeAsyncOperation } from '@/utils/errorHandling';

interface UseAutoSaveProps {
  selectedDate: string;
  isDatabaseReady: boolean;
  onContentSaved?: (content: string) => void;
}

interface UseAutoSaveReturn {
  saveContent: (content: string) => void;
  isSaving: boolean;
  forceSave: (getContent: () => Promise<string>) => Promise<void>;
  resetLastSavedContent: (content: string) => void;
}

export function useAutoSave({
  selectedDate,
  isDatabaseReady,
  onContentSaved,
}: UseAutoSaveProps): UseAutoSaveReturn {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const saveContent = useCallback(
    async (content: string) => {
      if (
        !selectedDate ||
        !isDatabaseReady ||
        content === lastSavedContentRef.current ||
        !content ||
        content === EDITOR_CONSTANTS.EMPTY_CONTENT ||
        isSaving
      ) {
        return;
      }

      setIsSaving(true);

      const { error } = await safeAsyncOperation(
        () => noteOperations.saveNote(selectedDate, content),
        'save note'
      );

      if (error) {
        handleComponentError('useAutoSave', error, 'saving note content');
      } else {
        lastSavedContentRef.current = content;
        onContentSaved?.(content);
      }

      setIsSaving(false);
    },
    [selectedDate, isDatabaseReady, onContentSaved, isSaving]
  );

  const debouncedSaveContent = useCallback(
    (content: string) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        saveContent(content);
      }, EDITOR_CONSTANTS.AUTO_SAVE_DEBOUNCE_MS) as unknown as NodeJS.Timeout;
    },
    [saveContent]
  );

  const forceSave = useCallback(
    async (getContent: () => Promise<string>) => {
      try {
        // Clear any pending debounced save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }

        const content = await getContent();
        await saveContent(content);
      } catch (error) {
        handleComponentError('useAutoSave', error, 'force saving');
      }
    },
    [saveContent]
  );

  // Reset last saved content when date changes
  const resetLastSavedContent = useCallback((content: string) => {
    lastSavedContentRef.current = content;
  }, []);

  return {
    saveContent: debouncedSaveContent,
    isSaving,
    forceSave,
    resetLastSavedContent,
  };
}