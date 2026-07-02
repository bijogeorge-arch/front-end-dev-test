import { useState, useMemo, useCallback } from "react";
import { Task, TaskPriority, TaskStatus, SortByKey } from "../types/task";

/**
 * @file useTaskFilters.ts
 * @description Orchestrates multi-criteria client-side filtering and sorting.
 *
 * Accepts the raw task list (already pre-filtered by `useSearch`) and applies:
 * - Status filter
 * - Priority filter
 * - Sort by due date or priority weight
 *
 * Uses:
 * - `useState`    — local filter/sort state
 * - `useMemo`     — expensive sort pipeline only re-runs on dependency change
 * - `useCallback` — stable setter references so consumers don't re-render unnecessarily
 *
 * Note: `SortByKey` is imported from `types/task.ts` — single source of truth.
 *
 * @example
 * const { filteredTasks, statusFilter, setStatusFilter, ... } = useTaskFilters(searchResults);
 */

/** Numeric weight map used for priority-based sorting. Higher = more urgent. */
const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export interface UseTaskFiltersReturn {
  filteredTasks: Task[];
  statusFilter: TaskStatus | "All";
  setStatusFilter: (status: TaskStatus | "All") => void;
  priorityFilter: TaskPriority | "All";
  setPriorityFilter: (priority: TaskPriority | "All") => void;
  sortBy: SortByKey;
  setSortBy: (key: SortByKey) => void;
  /** True when any filter or sort is not at its default "All"/"none" value. */
  isFiltered: boolean;
  /** Resets all filters and sorting to defaults. */
  resetFilters: () => void;
}

/**
 * Applies status/priority filters and sorting to a given task array.
 *
 * @param tasks - The task array to filter/sort (typically the output of `useSearch`).
 */
export function useTaskFilters(tasks: Task[]): UseTaskFiltersReturn {
  const [statusFilter, setStatusFilterRaw] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilterRaw] = useState<TaskPriority | "All">("All");
  const [sortBy, setSortByRaw] = useState<SortByKey>("none");

  /** Memoized filter + sort pipeline — runs only when dependencies change. */
  const filteredTasks = useMemo<Task[]>(() => {
    // Start with a shallow copy to avoid mutating the original array.
    let result = [...tasks];

    // Status filter — .filter() over status field
    if (statusFilter !== "All") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Priority filter — .filter() over priority field
    if (priorityFilter !== "All") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Sorting — .sort() is applied in-place on the already filtered shallow copy
    if (sortBy === "dueDate") {
      result.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      });
    } else if (sortBy === "priority") {
      result.sort((a, b) => {
        const weightA = PRIORITY_WEIGHTS[a.priority] ?? 0;
        const weightB = PRIORITY_WEIGHTS[b.priority] ?? 0;
        return weightB - weightA; // descending: High → Medium → Low
      });
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, sortBy]);

  const isFiltered =
    statusFilter !== "All" || priorityFilter !== "All" || sortBy !== "none";

  // Stable setters — useCallback prevents unnecessary child re-renders.
  const setStatusFilter = useCallback(
    (status: TaskStatus | "All") => setStatusFilterRaw(status),
    []
  );

  const setPriorityFilter = useCallback(
    (priority: TaskPriority | "All") => setPriorityFilterRaw(priority),
    []
  );

  const setSortBy = useCallback(
    (key: SortByKey) => setSortByRaw(key),
    []
  );

  const resetFilters = useCallback(() => {
    setStatusFilterRaw("All");
    setPriorityFilterRaw("All");
    setSortByRaw("none");
  }, []);

  return {
    filteredTasks,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    isFiltered,
    resetFilters,
  };
}
