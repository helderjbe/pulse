import type { DatabaseError } from '@/types';

/**
 * Creates a standardized error with additional context
 */
export function createError(message: string, code?: string, originalError?: Error): DatabaseError {
  const error = new Error(message) as DatabaseError;
  error.code = code;
  if (originalError) {
    error.stack = originalError.stack;
    error.cause = originalError;
  }
  return error;
}

/**
 * Handles database operation errors with consistent logging and error creation
 */
export function handleDatabaseError(operation: string, error: unknown): DatabaseError {
  const errorMessage = `Database ${operation} failed`;
  
  if (error instanceof Error) {
    console.error(`${errorMessage}:`, error.message);
    return createError(errorMessage, 'DATABASE_ERROR', error);
  }
  
  console.error(`${errorMessage}: Unknown error`, error);
  return createError(errorMessage, 'DATABASE_UNKNOWN_ERROR');
}

/**
 * Safely executes an async operation with error handling
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<{ data: T | null; error: DatabaseError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleDatabaseError(errorContext, error) };
  }
}

/**
 * Handles component-level errors with consistent logging
 */
export function handleComponentError(componentName: string, error: unknown, context?: string): void {
  const contextText = context ? ` (${context})` : '';
  const errorMessage = `Error in ${componentName}${contextText}`;
  
  if (error instanceof Error) {
    console.error(`${errorMessage}:`, error.message);
  } else {
    console.error(`${errorMessage}: Unknown error`, error);
  }
}