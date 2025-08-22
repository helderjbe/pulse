import { useCallback, useEffect, useRef, useState } from 'react';
import { EDITOR_CONSTANTS } from '@/constants/AppConstants';
import { noteOperations } from '@/lib/database';
import { handleComponentError, safeAsyncOperation } from '@/utils/errorHandling';
import type { EditorBridge } from '@10play/tentap-editor';

interface UseNoteEditorProps {
  selectedDate: string;
  isDatabaseReady: boolean;
  editor: EditorBridge;
  onContentSaved?: (content: string) => void;
}

interface UseNoteEditorReturn {
  isLoadingOrSaving: boolean;
  currentContent: string;
  handleContentChange: (content: string) => void;
  forceSave: () => Promise<void>;
}

export function useNoteEditor({
  selectedDate,
  isDatabaseReady,
  editor,
  onContentSaved,
}: UseNoteEditorProps): UseNoteEditorReturn {
  const [isLoadingOrSaving, setIsLoadingOrSaving] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isLoadingRef = useRef(false);

  // Load note content when date changes
  useEffect(() => {
    const loadNote = async () => {
      if (!selectedDate || !isDatabaseReady || isLoadingRef.current) {
        return;
      }

      setIsLoadingOrSaving(true);
      isLoadingRef.current = true;

      const { data: note, error } = await safeAsyncOperation(
        () => noteOperations.getNote(selectedDate),
        'load note'
      );

      if (error) {
        handleComponentError('useNoteEditor', error, 'loading note content');
        setCurrentContent('');
        editor.setContent('');
      } else {
        const content = note?.text || '';
        setCurrentContent(content);
        lastSavedContentRef.current = content;
        
        // Only update editor if content is different
        if (content !== currentContent) {
          editor.setContent(content);
        }
      }

      setIsLoadingOrSaving(false);
      isLoadingRef.current = false;
    };

    loadNote();
  }, [selectedDate, isDatabaseReady]);

  // Save content to database
  const saveContent = useCallback(
    async (content: string) => {
      if (
        !selectedDate ||
        !isDatabaseReady ||
        content === lastSavedContentRef.current ||
        content === EDITOR_CONSTANTS.EMPTY_CONTENT ||
        isLoadingRef.current
      ) {
        return;
      }

      setIsLoadingOrSaving(true);

      const { error } = await safeAsyncOperation(
        () => noteOperations.saveNote(selectedDate, content),
        'save note'
      );

      if (error) {
        handleComponentError('useNoteEditor', error, 'saving note content');
      } else {
        lastSavedContentRef.current = content;
        setCurrentContent(content);
        onContentSaved?.(content);
      }

      setIsLoadingOrSaving(false);
    },
    [selectedDate, isDatabaseReady, onContentSaved]
  );

  // Debounced content change handler
  const handleContentChange = useCallback(
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

  // Force save for immediate saving (e.g., when changing dates)
  const forceSave = useCallback(async () => {
    try {
      // Clear any pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const content = await editor.getHTML();
      await saveContent(content);
    } catch (error) {
      handleComponentError('useNoteEditor', error, 'force saving');
    }
  }, [editor, saveContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoadingOrSaving,
    currentContent,
    handleContentChange,
    forceSave,
  };
}