import { useEffect, useMemo } from 'react';
import { useDataWithState } from './useDataWithState';
import { usePaginatedData } from './usePaginatedData';

/**
 * useListPage - Ultra-high-level hook combining data fetch + pagination + semantic state
 *
 * This is the ultimate convenience hook that handles:
 * - Data fetching with semantic state
 * - Pagination management
 * - All state transitions
 * - Refetch and navigation
 *
 * Use this when you want maximum convenience with minimal code.
 *
 * @param fetchFn - Function that fetches array data
 * @param dependencies - Dependencies array for refetch
 * @param pageSize - Items per page (default: 12)
 * @returns Complete list page data and controls
 *
 * @example
 * const { items, state, page, nextPage, prevPage, refetch } = useListPage(
 *   () => api.getItems(),
 *   [filters],
 *   12
 * );
 *
 * return (
 *   <>
 *     {state === 'loading' && <SkeletonLoader />}
 *     {state === 'empty' && <EmptyState />}
 *     {state === 'ready' && (
 *       <>
 *         {items.map(item => <ItemCard key={item.id} item={item} />)}
 *         {/* Pagination if needed */}
 *       </>
 *     )}
 *   </>
 * );
 */
export function useListPage<T extends any>(
  fetchFn: () => Promise<T[]>,
  dependencies: any[] = [],
  pageSize: number = 12,
  onStateChange?: (state: 'loading' | 'empty' | 'error' | 'ready') => void
) {
  // Fetch data with semantic state
  const { data, state, error, refetch } = useDataWithState(
    fetchFn,
    dependencies,
    {
      onError: (err) => {
        onStateChange?.('error');
      }
    }
  );

  // Setup pagination
  const { page, pageSize: currentPageSize, nextPage, prevPage, goToPage, canGoNext, canGoPrev, totalPages } = usePaginatedData(
    data?.length || 0,
    { initialPageSize: pageSize }
  );

  // Notify state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Calculate paginated items
  const items = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * currentPageSize;
    const end = start + currentPageSize;
    return data.slice(start, end);
  }, [data, page, currentPageSize]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => ({
    page,
    pageSize: currentPageSize,
    totalPages,
    totalItems: data?.length || 0,
    canGoNext,
    canGoPrev,
  }), [page, currentPageSize, totalPages, data?.length, canGoNext, canGoPrev]);

  // Memoized navigation
  const navigation = useMemo(() => ({
    nextPage,
    prevPage,
    goToPage,
    refetch,
  }), [nextPage, prevPage, goToPage, refetch]);

  return {
    // Data
    items,
    allData: data,

    // State
    state,
    isLoading: state === 'loading',
    isEmpty: state === 'empty',
    isError: state === 'error',
    isReady: state === 'ready',
    error,

    // Pagination
    ...paginationInfo,

    // Navigation
    ...navigation,
  };
}

/**
 * USAGE EXAMPLES
 *
 * Example 1: Simple list
 * const { items, state, refetch } = useListPage(() => api.getItems());
 *
 * Example 2: With page size
 * const { items, state, page, nextPage, prevPage } = useListPage(
 *   () => api.getItems(),
 *   [],
 *   20
 * );
 *
 * Example 3: Full usage
 * const {
 *   items,
 *   state,
 *   isLoading,
 *   isEmpty,
 *   isError,
 *   page,
 *   totalPages,
 *   nextPage,
 *   prevPage,
 *   refetch,
 *   error
 * } = useListPage(() => api.getItems(), [userId]);
 *
 * Example 4: With state tracking
 * const {
 *   items,
 *   state,
 *   ...rest
 * } = useListPage(
 *   () => api.getItems(),
 *   [filters],
 *   12,
 *   (newState) => {
 *     console.log('State changed to:', newState);
 *   }
 * );
 */
