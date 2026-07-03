import { useState, useMemo, useCallback } from "react";

/**
 * @file usePagination.ts
 * @description Generic client-side pagination hook.
 *
 * Slices any array into pages of a fixed size and exposes navigation helpers.
 * Page resets to 1 automatically when the derived totalPages drops below the
 * current page (e.g. when search/filter results shrink the item set).
 *
 * Uses:
 * - `useState`    — current page number (1-indexed)
 * - `useMemo`     — page slice + page count recalculate only on dependency change
 * - `useCallback` — stable navigation callbacks
 *
 * @example
 * const { currentItems, currentPage, totalPages, goToPage, nextPage, prevPage }
 *   = usePagination(filteredTasks, 6);
 */

export interface UsePaginationReturn<T> {
  /** The slice of items for the current page. */
  currentItems: T[];
  /** The currently active page number (1-indexed). */
  currentPage: number;
  /** Total number of pages given the item count and page size. */
  totalPages: number;
  /** Whether a previous page exists. */
  hasPrevPage: boolean;
  /** Whether a next page exists. */
  hasNextPage: boolean;
  /** Navigate to a specific page number. Clamped to valid range. */
  goToPage: (page: number) => void;
  /** Navigate to the next page (no-op on last page). */
  nextPage: () => void;
  /** Navigate to the previous page (no-op on first page). */
  prevPage: () => void;
  /** Total number of items across all pages. */
  totalItems: number;
  /** Index of the first item on the current page (1-indexed, for display). */
  startItem: number;
  /** Index of the last item on the current page (1-indexed, for display). */
  endItem: number;
}

/**
 * Paginates an array of items.
 *
 * @param items    - The full array to paginate (typically filtered task list).
 * @param pageSize - Number of items to display per page. Defaults to 6.
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 6
): UsePaginationReturn<T> {
  const [requestedPage, setRequestedPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  );

  // Clamp the stored page to be within the valid range.
  // This means when items shrink (filter/search changes), we auto-reset
  // without needing a useEffect — the clamped value is derived synchronously.
  const currentPage = Math.min(requestedPage, totalPages);

  const currentItems = useMemo<T[]>(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback(
    (page: number) => {
      // Clamp at call time; totalPages will also clamp the final value above
      setRequestedPage(Math.max(1, page));
    },
    []
  );

  const nextPage = useCallback(() => {
    setRequestedPage((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setRequestedPage((p) => Math.max(p - 1, 1));
  }, []);

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const totalItems = items.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return {
    currentItems,
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    goToPage,
    nextPage,
    prevPage,
    totalItems,
    startItem,
    endItem,
  };
}
