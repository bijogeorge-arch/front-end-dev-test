import React, { memo, useRef, useState, useCallback } from "react";
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
  /**
   * Called when a drag-and-drop reorder completes.
   * Receives the dragged task's id and the id of the task it was dropped onto,
   * so the parent can map them to store indices.
   *
   * @param draggedId - id of the task being dragged
   * @param targetId  - id of the task at the drop destination
   */
  onReorder?: (draggedId: number, targetId: number) => void;
}

/**
 * Renders the grid of task cards with loading, empty-state guards,
 * and native HTML5 drag-and-drop reordering.
 *
 * Drag-and-drop:
 * - Uses the HTML5 Drag-and-Drop API (no external library).
 * - A `dragOver` ghost class is applied to the drop target for visual feedback.
 * - On `drop`, calls `onReorder(draggedId, targetId)` so the parent can
 *   resolve absolute store indices and persist the new order.
 *
 * Wrapped in `React.memo` to prevent re-renders when parent state changes
 * that don't affect the task list (e.g., modal open/close state).
 */
export const TaskList: React.FC<TaskListProps> = memo(
  ({ tasks, loading = false, onDeleteTask, onUpdateTaskStatus, onEditTask, onReorder }) => {
    // Track which card is being dragged (by task id)
    const draggedId = useRef<number | null>(null);
    // Track which card is the current drop target (for hover class)
    const [dragOverId, setDragOverId] = useState<number | null>(null);

    // ── Drag-and-drop handlers ──────────────────────────────────────────────

    const handleDragStart = useCallback(
      (e: React.DragEvent<HTMLDivElement>, id: number) => {
        draggedId.current = id;
        // Required for Firefox compatibility
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(id));
      },
      []
    );

    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>, id: number) => {
        e.preventDefault(); // Necessary to allow drop
        e.dataTransfer.dropEffect = "move";
        if (id !== draggedId.current) {
          setDragOverId(id);
        }
      },
      []
    );

    const handleDragLeave = useCallback(() => {
      setDragOverId(null);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
        e.preventDefault();
        setDragOverId(null);
        if (draggedId.current !== null && draggedId.current !== targetId) {
          onReorder?.(draggedId.current, targetId);
        }
        draggedId.current = null;
      },
      [onReorder]
    );

    const handleDragEnd = useCallback(() => {
      draggedId.current = null;
      setDragOverId(null);
    }, []);

    // ── Conditional rendering ───────────────────────────────────────────────

    // Loading state
    if (loading) {
      return (
        <div className={styles.loadingContainer} id="task-list-loading" role="status" aria-label="Loading tasks">
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Loading tasks…</p>
        </div>
      );
    }

    // Empty state
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
          <div
            key={task.id}
            role="listitem"
            draggable={!!onReorder}
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={(e) => handleDragOver(e, task.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, task.id)}
            onDragEnd={handleDragEnd}
            className={`${styles.cardWrapper} ${
              dragOverId === task.id ? styles.dragOver : ""
            } ${draggedId.current === task.id ? styles.dragging : ""}`}
            aria-grabbed={draggedId.current === task.id ? true : undefined}
          >
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
