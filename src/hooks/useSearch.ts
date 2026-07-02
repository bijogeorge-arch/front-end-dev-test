import { useState, useMemo, useCallback, useRef, RefObject } from "react";
import { Task } from "../types/task";
import { useDebounce } from "./useDebounce";

/**
 * @file useSearch.ts
 * @description Custom hook that encapsulates debounced, case-insensitive
 * search across task titles and assignee names.
 *
 * Uses:
 * - `useState` to track the raw query input
 * - `useDebounce` to delay filtering until the user stops typing (300ms)
 * - `useMemo` to run the `.filter()` pipeline only when dependencies change
 * - `useCallback` to expose a stable setter reference
 * - `useRef` to expose an input ref for external focus control
 *
 * @example
 * const { searchQuery, setSearchQuery, searchResults, inputRef } = useSearch(tasks);
 */
export interface UseSearchReturn {
  /** The current raw (non-debounced) value driving the input. */
  searchQuery: string;
  /** Stable setter for `searchQuery`. */
  setSearchQuery: (query: string) => void;
  /** Tasks that pass the debounced search filter. */
  searchResults: Task[];
  /** Ref to attach to the search `<input>` element for imperative focus. */
  inputRef: RefObject<HTMLInputElement>;
}

export function useSearch(tasks: Task[]): UseSearchReturn {
  const [searchQuery, setSearchQueryRaw] = useState<string>("");
  const debouncedQuery = useDebounce<string>(searchQuery, 300);
  // useRef — exposed so consumers can imperatively focus the search input.
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Memoized filter pipeline.
   * Runs `.filter()` over `tasks` using `.toLowerCase().includes()` to match
   * `title` and `assignedTo` fields case-insensitively.
   */
  const searchResults = useMemo<Task[]>(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return tasks;
    const lower = trimmed.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lower) ||
        task.assignedTo.toLowerCase().includes(lower)
    );
  }, [tasks, debouncedQuery]);

  /** Stable callback — consumers will not re-render just from receiving this setter. */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryRaw(query);
  }, []);

  return { searchQuery, setSearchQuery, searchResults, inputRef };
}
