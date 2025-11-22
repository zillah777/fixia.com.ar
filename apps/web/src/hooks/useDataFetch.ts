import { useState, useCallback, useEffect } from 'react';

interface UseDataFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseDataFetchOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * useDataFetch - Optimized data fetching hook with retry logic
 * Follows Context7 best practices: high-level naming, proper memoization
 *
 * @param fetchFn - Async function that fetches data
 * @param dependencies - Dependency array for re-fetching
 * @param options - Configuration options
 * @returns Data, loading state, error, and refetch function
 * @example
 * const { data, isLoading, error, refetch } = useDataFetch(
 *   () => api.getOpportunities(),
 *   [userId]
 * );
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataFetchOptions = {}
) {
  const { onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options;

  const [state, setState] = useState<UseDataFetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const [retries, setRetries] = useState(0);

  // Memoized fetch function with retry logic
  const executeFetch = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const result = await fetchFn();
      setState({ data: result, isLoading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (retries < retryCount) {
        // Retry after delay
        setTimeout(() => {
          setRetries((r) => r + 1);
        }, retryDelay);
      } else {
        setState({ data: null, isLoading: false, error });
        onError?.(error);
      }
    }
  }, [fetchFn, retries, retryCount, retryDelay, onSuccess, onError]);

  // Memoized refetch function
  const refetch = useCallback(() => {
    setRetries(0);
    executeFetch();
  }, [executeFetch]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    executeFetch();
  }, [...dependencies, executeFetch]);

  return {
    ...state,
    refetch,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
  };
}
