import React, { memo } from "react";
import styles from "./TaskList.module.css";
import { Task, TaskStatus } from "../../types/task";
import { TaskCard } from "../TaskCard/TaskCard";
import { FolderOpen } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onDeleteTask: (id: number) => void;
  onUpdateTaskStatus: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

/**
 * Renders the grid of task cards with loading and empty-state guards.
 *
 * Wrapped in `React.memo` to prevent re-renders when parent state changes
 * that don't affect the task list (e.g., modal open/close state).
 */
export const TaskList: React.FC<TaskListProps> = memo(
  ({ tasks, loading = false, onDeleteTask, onUpdateTaskStatus, onEditTask }) => {
    // Conditional rendering: loading state
    if (loading) {
      return (
        <div className={styles.loadingContainer} id="task-list-loading" role="status" aria-label="Loading tasks">
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Loading tasks…</p>
        </div>
      );
    }

    // Conditional rendering: empty state
    if (tasks.length === 0) {
      return (
        <div className={styles.emptyContainer} id="task-list-empty" role="status">
          <FolderOpen className={styles.emptyIcon} size={48} aria-hidden="true" />
          <p className={styles.emptyTitle}>No Tasks Available</p>
          <p className={styles.emptySubtitle}>
            Try adjusting your search or filters, or create a new task.
          </p>
        </div>
      );
    }

    return (
      <div
        className={styles.grid}
        id="task-list-grid"
        role="list"
        aria-label={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
      >
        {tasks.map((task) => (
          <div key={task.id} role="listitem">
            <TaskCard
              task={task}
              onDelete={onDeleteTask}
              onUpdateStatus={onUpdateTaskStatus}
              onEdit={onEditTask}
            />
          </div>
        ))}
      </div>
    );
  }
);

TaskList.displayName = "TaskList";
