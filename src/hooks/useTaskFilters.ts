import { useState, useMemo, useCallback } from "react";
import { Task, TaskPriority, TaskStatus } from "../types/task";
import { useDebounce } from "./useDebounce";

export type SortByKey = "dueDate" | "priority" | "none";

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function useTaskFilters(tasks: Task[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">("All");
  const [sortBy, setSortBy] = useState<SortByKey>("none");

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  // useMemo — expensive filter + sort pipeline only re-runs when dependencies change
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search: title or assignedTo, case-insensitive
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.assignedTo.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "All") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Sorting
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
        return weightB - weightA;
      });
    }

    return result;
  }, [tasks, debouncedSearchQuery, statusFilter, priorityFilter, sortBy]);

  // useCallback — stable setter references so consumers don't re-render unnecessarily
  const stableSetSearchQuery = useCallback(
    (query: string) => setSearchQuery(query),
    []
  );

  const stableSetStatusFilter = useCallback(
    (status: TaskStatus | "All") => setStatusFilter(status),
    []
  );

  const stableSetPriorityFilter = useCallback(
    (priority: TaskPriority | "All") => setPriorityFilter(priority),
    []
  );

  const stableSetSortBy = useCallback(
    (key: SortByKey) => setSortBy(key),
    []
  );

  return {
    searchQuery,
    setSearchQuery: stableSetSearchQuery,
    statusFilter,
    setStatusFilter: stableSetStatusFilter,
    priorityFilter,
    setPriorityFilter: stableSetPriorityFilter,
    sortBy,
    setSortBy: stableSetSortBy,
    filteredTasks,
  };
}
