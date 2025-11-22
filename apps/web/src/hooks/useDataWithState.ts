import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useLoadingState } from './useLoadingState';

interface UseDataWithStateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

type DataState = 'loading' | 'empty' | 'error' | 'ready';

interface UseDataWithStateResult<T> {
  data: T | null;
  state: DataState;
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  isReady: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * useDataWithState - High-level hook combining data fetch + loading state management
 * Provides semantic data state (loading, empty, error, ready) for clean UI logic
 * Follows Context7 best practices: high-level naming, composition, memoization
 *
 * @param fetchFn - Async function that fetches data
 * @param dependencies - Dependency array for re-fetching
 * @param options - Configuration options
 * @returns Comprehensive data state with semantic state indicator
 * @example
 * const { data, state, isLoading, isEmpty, refetch } = useDataWithState(
 *   () => api.getOpportunities(),
 *   [userId]
 * );
 *
 * return (
 *   <>
 *     {state === 'loading' && <SkeletonLoader variant="list" />}
 *     {state === 'empty' && <EmptyState title="No opportunities" />}
 *     {state === 'error' && <ErrorBanner error={error} onRetry={refetch} />}
 *     {state === 'ready' && <OpportunitiesList items={data} />}
 *   </>
 * );
 */
export function useDataWithState<T extends any[]>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataWithStateOptions = {}
): UseDataWithStateResult<T> {
  const { data, isLoading, error, refetch } = useDataFetch(
    fetchFn,
    dependencies,
    options
  );

  // Memoized state determination logic
  const state: DataState = useMemo(() => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (data && Array.isArray(data) && data.length === 0) return 'empty';
    return 'ready';
  }, [isLoading, error, data]);

  // Memoized semantic state flags
  const semanticFlags = useMemo(
    () => ({
      isLoading: state === 'loading',
      isEmpty: state === 'empty',
      isError: state === 'error',
      isReady: state === 'ready',
    }),
    [state]
  );

  return {
    data,
    state,
    error,
    refetch,
    ...semanticFlags,
  };
}
