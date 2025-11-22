/**
 * Custom Hooks Index
 * Centralized export for all custom hooks following Context7 best practices
 *
 * Hook Levels (pick the right one for your needs):
 *
 * LEVEL 1 - Low-level utilities:
 * - useLoadingState: Simple loading state management with memoized setters
 * - usePaginatedData: Pagination with page navigation and size management
 *
 * LEVEL 2 - Mid-level building blocks:
 * - useDataFetch: Data fetching with retry logic and lifecycle management
 * - useDataWithState: Combined fetch + semantic state (loading/empty/error/ready)
 *
 * LEVEL 3 - Ultra-high-level convenience:
 * - useListPage: Complete list page (fetch + pagination + state) in ONE hook
 */

export { useLoadingState } from './useLoadingState';
export { usePaginatedData } from './usePaginatedData';
export { useDataFetch } from './useDataFetch';
export { useDataWithState } from './useDataWithState';
export { useListPage } from './useListPage';
