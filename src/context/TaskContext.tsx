/**
 * @file TaskContext.tsx
 * @description React Context layer for the Employee Task Management Dashboard.
 *
 * Bridges the Zustand store with React's native Context API so that
 * consumers can access task state and actions via `useContext` — satisfying
 * the React Context requirement while keeping Zustand as the persistence
 * and state-management engine.
 *
 * Data flow:
 *   Zustand store (persistence + mutations)
 *     → TaskProvider (reads store, publishes via Context)
 *       → useTaskContext() consumers (DashboardLayout, etc.)
 *
 * Uses:
 * - `createContext` — creates the typed task context
 * - `useContext`    — consumed by `useTaskContext` hook
 * - `useMemo`       — prevents unnecessary context re-renders by
 *                     memoizing the context value object
 *
 * @example
 * const { tasks, addTask, deleteTask, updateTaskStatus } = useTaskContext();
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useTaskStore, TaskState } from '../store/useTaskStore';

// ---------------------------------------------------------------------------
// Context type — exposes the full Zustand slice to consumers
// ---------------------------------------------------------------------------

type TaskContextValue = TaskState;

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Wraps the component tree with the TaskContext value.
 * Must be placed inside the React tree before any component that calls
 * `useTaskContext()`.
 */
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Subscribe to the full Zustand store slice
  const tasks = useTaskStore((state) => state.tasks);
  const initializeTasks = useTaskStore((state) => state.initializeTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const updateTask = useTaskStore((state) => state.updateTask);
  const clearAllTasks = useTaskStore((state) => state.clearAllTasks);

  /**
   * Memoize the context value so that consumers only re-render when the
   * tasks array or an action reference actually changes — not on every
   * unrelated parent render.
   */
  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      initializeTasks,
      addTask,
      deleteTask,
      updateTaskStatus,
      updateTask,
      clearAllTasks,
    }),
    [tasks, initializeTasks, addTask, deleteTask, updateTaskStatus, updateTask, clearAllTasks]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Custom hook that reads the TaskContext via `useContext`.
 *
 * @throws {Error} When called outside a `<TaskProvider>` — provides a
 * clear diagnostic instead of a cryptic undefined-access failure.
 *
 * @example
 * const { tasks, addTask, deleteTask } = useTaskContext();
 */
export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error(
      '[useTaskContext] must be used inside a <TaskProvider>. ' +
        'Ensure your component tree is wrapped with <TaskProvider>.'
    );
  }
  return context;
}
