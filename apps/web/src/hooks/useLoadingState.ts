import { useState, useCallback } from 'react';

/**
 * useLoadingState - Optimized loading state management hook
 * Follows Context7 best practices: high-level naming, proper memoization
 *
 * @returns Object with loading state and control methods
 * @example
 * const { isLoading, setLoading, startLoading, stopLoading } = useLoadingState();
 */
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  // Memoized setters using useCallback to prevent unnecessary re-renders
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

  return {
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
  };
}
