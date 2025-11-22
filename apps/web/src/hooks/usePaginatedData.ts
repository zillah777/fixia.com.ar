import { useState, useCallback, useEffect } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UsePaginatedDataOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number) => void;
}

/**
 * usePaginatedData - Data pagination management hook
 * Follows Context7 best practices: high-level naming, proper memoization
 *
 * @param total - Total number of items
 * @param options - Configuration options
 * @returns Pagination state and control methods
 * @example
 * const { page, pageSize, goToPage, nextPage, prevPage, setPageSize } = usePaginatedData(100);
 */
export function usePaginatedData(
  total: number,
  options: UsePaginatedDataOptions = {}
) {
  const { initialPage = 1, initialPageSize = 10, onPageChange } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(total / pageSize);

  // Notify on page changes
  useEffect(() => {
    onPageChange?.(page);
  }, [page, onPageChange]);

  // Memoized navigation methods
  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const updatePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page on size change
  }, []);

  const state: PaginationState = {
    page,
    pageSize,
    total,
    totalPages,
  };

  return {
    ...state,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: updatePageSize,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
  };
}
