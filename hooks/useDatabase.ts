import { useCallback, useEffect, useState } from 'react';
import { initDatabase, noteOperations } from '@/lib/database';
import { handleComponentError, safeAsyncOperation } from '@/utils/errorHandling';
import type { Note, DateString } from '@/types';

/**
 * Hook for managing database initialization state
 */
export function useDatabaseInit() {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      const { error } = await safeAsyncOperation(
        () => initDatabase(),
        'initialize database'
      );

      if (error) {
        setInitError(error);
        handleComponentError('useDatabaseInit', error, 'database initialization');
      } else {
        setIsDatabaseReady(true);
        setInitError(null);
      }
    };

    initializeDatabase();
  }, []);

  return { isDatabaseReady, initError };
}

/**
 * Hook for managing note operations with error handling
 */
export function useNoteOperations(isDatabaseReady: boolean) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Loads a note for a specific date
   */
  const loadNote = useCallback(async (date: DateString): Promise<Note | null> => {
    if (!isDatabaseReady) return null;

    setIsLoading(true);
    setError(null);

    const { data: note, error: loadError } = await safeAsyncOperation(
      () => noteOperations.getNote(date),
      'load note'
    );

    if (loadError) {
      setError(loadError);
      handleComponentError('useNoteOperations', loadError, 'loading note');
    }

    setIsLoading(false);
    return note;
  }, [isDatabaseReady]);

  /**
   * Saves a note for a specific date
   */
  const saveNote = useCallback(async (date: DateString, content: string): Promise<boolean> => {
    if (!isDatabaseReady) return false;

    setIsLoading(true);
    setError(null);

    const { error: saveError } = await safeAsyncOperation(
      () => noteOperations.saveNote(date, content),
      'save note'
    );

    if (saveError) {
      setError(saveError);
      handleComponentError('useNoteOperations', saveError, 'saving note');
      setIsLoading(false);
      return false;
    }

    setIsLoading(false);
    return true;
  }, [isDatabaseReady]);

  /**
   * Fetches all dates that have been edited
   */
  const getEditedDates = useCallback(async (): Promise<string[]> => {
    if (!isDatabaseReady) return [];

    setIsLoading(true);
    setError(null);

    const { data: dates, error: fetchError } = await safeAsyncOperation(
      () => noteOperations.getEditedDates(),
      'fetch edited dates'
    );

    if (fetchError) {
      setError(fetchError);
      handleComponentError('useNoteOperations', fetchError, 'fetching edited dates');
      setIsLoading(false);
      return [];
    }

    setIsLoading(false);
    return dates || [];
  }, [isDatabaseReady]);

  return {
    loadNote,
    saveNote,
    getEditedDates,
    isLoading,
    error,
  };
}

/**
 * Hook for managing edited dates state
 */
export function useEditedDates(isDatabaseReady: boolean) {
  const [editedDates, setEditedDates] = useState<string[]>([]);
  const { getEditedDates, isLoading, error } = useNoteOperations(isDatabaseReady);

  /**
   * Refreshes the edited dates from the database
   */
  const refreshEditedDates = useCallback(async () => {
    const dates = await getEditedDates();
    setEditedDates(dates);
  }, [getEditedDates]);

  // Load edited dates when database becomes ready
  useEffect(() => {
    if (isDatabaseReady) {
      refreshEditedDates();
    }
  }, [isDatabaseReady, refreshEditedDates]);

  return {
    editedDates,
    refreshEditedDates,
    isLoading,
    error,
  };
}