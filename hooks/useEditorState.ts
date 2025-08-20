import { useState } from 'react';

interface UseEditorStateReturn {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isActive: boolean;
}

export function useEditorState(): UseEditorStateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isActive = isLoading || isSaving;

  return {
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isActive,
  };
}