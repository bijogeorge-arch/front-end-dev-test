/**
 * @file useTaskStore.ts
 * @description Zustand store for the Employee Task Management Dashboard.
 *
 * Uses the `persist` middleware to transparently sync state to localStorage
 * under the key "task-dashboard-store". On first load, if the persisted store
 * contains no tasks, `initializeTasks()` should be called to seed mock data.
 *
 * All mutations are pure reducers — no side effects inside action bodies.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus } from "../types/task";
import { mockTasks } from "../data/mockTasks";

// ---------------------------------------------------------------------------
// State + Action shape
// ---------------------------------------------------------------------------

/**
 * Complete Zustand slice: state fields + action methods.
 */
export interface TaskState {
  /** Ordered list of all tasks in the system. */
  tasks: Task[];

  /**
   * Seeds the store with mock data when the tasks array is empty.
   * Safe to call on every app boot — it is a no-op when tasks already exist.
   */
  initializeTasks: () => void;

  /**
   * Appends a new task to the store.
   * `id` and `createdAt` are computed automatically.
   *
   * @param task - All task fields except `id` and `createdAt`.
   */
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;

  /**
   * Permanently removes a task by its numeric ID.
   * If no task with `id` exists, the state is unchanged.
   *
   * @param id - The unique identifier of the task to remove.
   */
  deleteTask: (id: number) => void;

  /**
   * Transitions a task's `status` to a new value.
   * If no task with `id` exists, the state is unchanged.
   *
   * @param id     - Target task identifier.
   * @param status - The new lifecycle status.
   */
  updateTaskStatus: (id: number, status: TaskStatus) => void;

  /**
   * Merges a partial update into the matching task.
   * Fields not present in `updates` are preserved unchanged.
   * `id` and `createdAt` cannot be overwritten through this action.
   *
   * @param id      - Target task identifier.
   * @param updates - Partial fields to merge into the existing task.
   */
  updateTask: (id: number, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;

  /**
   * Moves a task from one index position to another within the tasks array.
   * Used by the drag-and-drop handler to persist the user-defined custom order.
   *
   * @param fromIndex - The current index of the task being dragged.
   * @param toIndex   - The destination index where the task should be dropped.
   */
  reorderTasks: (fromIndex: number, toIndex: number) => void;

  /**
   * Wipes all tasks from the store.
   * Intended only for testing or manual data-reset workflows.
   */
  clearAllTasks: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the next available task ID using `.reduce()` for a single-pass
 * maximum scan. Returns 1 when the task list is empty.
 *
 * @param tasks - The current tasks array.
 * @returns A positive integer guaranteed to be unique within the current list.
 */
function nextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1;
  return (
    tasks.reduce((max, task) => (task.id > max ? task.id : max), 0) + 1
  );
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/**
 * Primary Zustand store for task data.
 *
 * @example
 * const { tasks, addTask, deleteTask, updateTask } = useTaskStore();
 */
export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      // -----------------------------------------------------------------------
      // Initial state
      // -----------------------------------------------------------------------
      tasks: [],

      // -----------------------------------------------------------------------
      // Actions
      // -----------------------------------------------------------------------

      initializeTasks: () =>
        set((state) => {
          // No-op if tasks already exist (persisted data takes precedence)
          if (state.tasks.length > 0) return state;
          return { tasks: mockTasks };
        }),

      addTask: (newTask) =>
        set((state) => {
          const taskWithMeta: Task = {
            ...newTask,
            id: nextId(state.tasks),
            createdAt: new Date().toISOString(),
          };
          return { tasks: [...state.tasks, taskWithMeta] };
        }),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      reorderTasks: (fromIndex, toIndex) =>
        set((state) => {
          const reordered = [...state.tasks];
          const [moved] = reordered.splice(fromIndex, 1);
          reordered.splice(toIndex, 0, moved);
          return { tasks: reordered };
        }),

      clearAllTasks: () => set({ tasks: [] }),
    }),
    {
      name: "task-dashboard-store",
    }
  )
);
