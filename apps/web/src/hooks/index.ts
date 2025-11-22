/**
 * Custom Hooks Index
 * Centralized export for all custom hooks following Context7 best practices
 *
 * High-level hooks for common patterns:
 * - useLoadingState: Simple loading state management with memoized setters
 * - usePaginatedData: Pagination with page navigation and size management
 * - useDataFetch: Data fetching with retry logic and lifecycle management
 * - useDataWithState: Combined hook with semantic state (loading/empty/error/ready)
 */

export { useLoadingState } from './useLoadingState';
export { usePaginatedData } from './usePaginatedData';
export { useDataFetch } from './useDataFetch';
export { useDataWithState } from './useDataWithState';
