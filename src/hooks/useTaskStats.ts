import { useMemo } from "react";
import { Task, TaskStatus, TASK_STATUSES } from "../types/task";

/**
 * @file useTaskStats.ts
 * @description Derives live aggregate statistics from the task list.
 *
 * Uses `useMemo` to ensure the `.reduce()` and `.filter()` computations
 * only re-run when the `tasks` array reference changes.
 *
 * @example
 * const { total, counts, overdueCount } = useTaskStats(tasks);
 */
export interface TaskStats {
  /** Total number of tasks in the store. */
  total: number;
  /** Per-status task counts keyed by `TaskStatus`. */
  counts: Record<TaskStatus, number>;
  /** Number of tasks whose `dueDate` is in the past and status is not Completed. */
  overdueCount: number;
}

/**
 * Returns memoized aggregate statistics derived from the task array.
 *
 * @param tasks - The full (unfiltered) task array from the store.
 */
export function useTaskStats(tasks: Task[]): TaskStats {
  return useMemo<TaskStats>(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Build per-status counts using .reduce() in a single pass.
    const counts = tasks.reduce<Record<TaskStatus, number>>(
      (acc, task) => {
        acc[task.status] = (acc[task.status] ?? 0) + 1;
        return acc;
      },
      // Seed the accumulator with zeroes for every status (no missing keys).
      Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<
        TaskStatus,
        number
      >
    );

    // Count tasks that are overdue: past due date and not yet Completed.
    const overdueCount = tasks.filter(
      (task) =>
        task.dueDate < today &&
        task.status !== "Completed" &&
        task.status !== "Rejected"
    ).length;

    return { total: tasks.length, counts, overdueCount };
  }, [tasks]);
}
