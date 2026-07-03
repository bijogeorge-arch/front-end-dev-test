/**
 * @file usePagination.test.ts
 * @description Unit tests for the usePagination custom hook.
 *
 * Coverage:
 * - Returns the correct first-page slice
 * - Computes totalPages correctly
 * - goToPage navigates to the specified page
 * - nextPage / prevPage navigate relative to current page
 * - hasPrevPage / hasNextPage flags are set correctly
 * - startItem / endItem display values are correct
 * - Resets to page 1 when the items array changes
 * - Single-page edge case (totalPages === 1)
 * - Empty array edge case
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../hooks/usePagination';

// Generate an array of N simple items
const makeItems = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

describe('usePagination', () => {
  const PAGE_SIZE = 3;

  it('returns the correct first-page slice', () => {
    const items = makeItems(9);
    const { result } = renderHook(() => usePagination(items, PAGE_SIZE));
    expect(result.current.currentItems).toEqual([1, 2, 3]);
  });

  it('computes totalPages correctly', () => {
    expect(renderHook(() => usePagination(makeItems(9), 3)).result.current.totalPages).toBe(3);
    expect(renderHook(() => usePagination(makeItems(7), 3)).result.current.totalPages).toBe(3);
    expect(renderHook(() => usePagination(makeItems(6), 3)).result.current.totalPages).toBe(2);
  });

  it('goToPage navigates to the specified page and returns correct slice', () => {
    const items = makeItems(9);
    const { result } = renderHook(() => usePagination(items, PAGE_SIZE));

    act(() => result.current.goToPage(2));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.currentItems).toEqual([4, 5, 6]);

    act(() => result.current.goToPage(3));
    expect(result.current.currentItems).toEqual([7, 8, 9]);
  });

  it('goToPage clamps to valid range', () => {
    const { result } = renderHook(() => usePagination(makeItems(9), PAGE_SIZE));

    act(() => result.current.goToPage(0));   // below min
    expect(result.current.currentPage).toBe(1);

    act(() => result.current.goToPage(100)); // above max
    expect(result.current.currentPage).toBe(3);
  });

  it('nextPage advances by one and stops at last page', () => {
    const { result } = renderHook(() => usePagination(makeItems(9), PAGE_SIZE));

    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(2);

    act(() => result.current.nextPage());
    act(() => result.current.nextPage()); // already on last page — should not exceed
    expect(result.current.currentPage).toBe(3);
  });

  it('prevPage retreats by one and stops at first page', () => {
    const { result } = renderHook(() => usePagination(makeItems(9), PAGE_SIZE));

    act(() => result.current.goToPage(3));
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(2);

    act(() => result.current.prevPage());
    act(() => result.current.prevPage()); // already on first page — should not go below 1
    expect(result.current.currentPage).toBe(1);
  });

  it('hasPrevPage is false on first page and true elsewhere', () => {
    const { result } = renderHook(() => usePagination(makeItems(9), PAGE_SIZE));
    expect(result.current.hasPrevPage).toBe(false);

    act(() => result.current.nextPage());
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('hasNextPage is false on last page and true elsewhere', () => {
    const { result } = renderHook(() => usePagination(makeItems(9), PAGE_SIZE));
    expect(result.current.hasNextPage).toBe(true);

    act(() => result.current.goToPage(3));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('startItem and endItem reflect the correct 1-indexed range', () => {
    const { result } = renderHook(() => usePagination(makeItems(9), PAGE_SIZE));

    expect(result.current.startItem).toBe(1);
    expect(result.current.endItem).toBe(3);

    act(() => result.current.goToPage(2));
    expect(result.current.startItem).toBe(4);
    expect(result.current.endItem).toBe(6);

    act(() => result.current.goToPage(3));
    expect(result.current.startItem).toBe(7);
    expect(result.current.endItem).toBe(9);
  });

  it('endItem does not exceed total items on a partial last page', () => {
    const { result } = renderHook(() => usePagination(makeItems(8), PAGE_SIZE));

    act(() => result.current.goToPage(3));
    // Page 3 has only 2 items (items 7 and 8)
    expect(result.current.endItem).toBe(8);
    expect(result.current.currentItems).toEqual([7, 8]);
  });

  it('clamps to the last page when the items array shrinks', () => {
    let items = makeItems(9);
    const { result, rerender } = renderHook(({ i }) => usePagination(i, PAGE_SIZE), {
      initialProps: { i: items },
    });

    act(() => result.current.goToPage(3));
    expect(result.current.currentPage).toBe(3);

    // Shrink to 6 items -> totalPages = 2; page 3 is clamped to 2
    items = makeItems(6);
    rerender({ i: items });
    expect(result.current.currentPage).toBe(2);

    // Shrink further to 3 items -> totalPages = 1; page clamped to 1
    items = makeItems(3);
    rerender({ i: items });
    expect(result.current.currentPage).toBe(1);
  });

  it('handles an empty array gracefully', () => {
    const { result } = renderHook(() => usePagination([], PAGE_SIZE));
    expect(result.current.currentItems).toEqual([]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.startItem).toBe(0);
    expect(result.current.endItem).toBe(0);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('handles a single page (items ≤ pageSize)', () => {
    const { result } = renderHook(() => usePagination(makeItems(3), PAGE_SIZE));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.currentItems).toHaveLength(3);
  });
});
