import React, { useState, memo } from "react";
import styles from "./TaskCard.module.css";
import { Task, TaskPriority, TaskStatus } from "../../types/task";
import {
  RotateCcw, AlertTriangle, Pencil, Trash2,
  User, Calendar, ArrowUp, ArrowRight, ArrowDown,
  X, Play, Check, Clock
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a locale-friendly format.
 * The 'T00:00:00' suffix forces local-timezone parsing, preventing the
 * common UTC off-by-one-day bug when calling `toLocaleDateString`.
 */
const formatDueDate = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/**
 * Returns true when a task is considered overdue:
 * its due date is in the past and its status is neither Completed nor Rejected.
 */
const isOverdue = (task: Task): boolean => {
  const today = new Date().toISOString().slice(0, 10);
  return (
    task.dueDate < today &&
    task.status !== "Completed" &&
    task.status !== "Rejected"
  );
};

// ─── Switch-case: Status Badge ───────────────────────────────────────────────
const renderStatusBadge = (taskStatus: TaskStatus) => {
  let Icon: React.ElementType;
  let statusClass: string;

  switch (taskStatus) {
    case "Pending":
      Icon = Clock;
      statusClass = styles.badgePending;
      break;
    case "In Progress":
      Icon = Play;
      statusClass = styles.badgeInProgress;
      break;
    case "Completed":
      Icon = Check;
      statusClass = styles.badgeCompleted;
      break;
    case "Rejected":
      Icon = X;
      statusClass = styles.badgeRejected;
      break;
    default:
      Icon = Clock;
      statusClass = styles.badgePending;
  }

  return (
    <span className={styles.statusBadge}>
      <span className={`${styles.statusIconCircle} ${statusClass}`}>
        <Icon size={10} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className={styles.statusLabelText}>{taskStatus}</span>
    </span>
  );
};

// ─── Switch-case: Priority Badge ─────────────────────────────────────────────
const renderPriorityBadge = (taskPriority: TaskPriority) => {
  switch (taskPriority) {
    case "High":
      return <span className={`${styles.priorityBadge} ${styles.priorityHigh}`}><ArrowUp size={18} strokeWidth={2} aria-hidden="true" /> HIGH</span>;
    case "Medium":
      return <span className={`${styles.priorityBadge} ${styles.priorityMedium}`}><ArrowRight size={18} strokeWidth={2} aria-hidden="true" /> MEDIUM</span>;
    case "Low":
      return <span className={`${styles.priorityBadge} ${styles.priorityLow}`}><ArrowDown size={18} strokeWidth={2} aria-hidden="true" /> LOW</span>;
    default:
      return <span className={styles.priorityBadge}>{taskPriority}</span>;
  }
};

// ─── Derive action buttons based on current status ────────────────────────────
const getActionButtons = (
  status: TaskStatus,
  id: number,
  title: string,
  onUpdateStatus: (id: number, status: TaskStatus) => void,
  styles: Record<string, string>
) => {
  switch (status) {
    case "Pending":
      return (
        <>
          <button
            className={`${styles.actionButton} ${styles.rejectButton}`}
            onClick={() => onUpdateStatus(id, "Rejected")}
            title="Reject Task"
            aria-label={`Reject task: ${title}`}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" /> Reject
          </button>
          <button
            className={`${styles.actionButton} ${styles.progressButton}`}
            onClick={() => onUpdateStatus(id, "In Progress")}
            title="Start task"
            aria-label={`Start task: ${title}`}
          >
            <Play size={18} strokeWidth={2} aria-hidden="true" /> Start
          </button>
        </>
      );
    case "In Progress":
      return (
        <>
          <button
            className={`${styles.actionButton} ${styles.rejectButton}`}
            onClick={() => onUpdateStatus(id, "Rejected")}
            title="Reject Task"
            aria-label={`Reject task: ${title}`}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" /> Reject
          </button>
          <button
            className={`${styles.actionButton} ${styles.progressButton}`}
            onClick={() => onUpdateStatus(id, "Completed")}
            title="Complete task"
            aria-label={`Complete task: ${title}`}
          >
            <Check size={18} strokeWidth={2} aria-hidden="true" /> Complete
          </button>
        </>
      );
    case "Completed":
      return (
        <button
          className={`${styles.actionButton} ${styles.reopenButton}`}
          onClick={() => onUpdateStatus(id, "Pending")}
          title="Reopen task"
          aria-label={`Reopen task: ${title}`}
        >
          <RotateCcw size={18} strokeWidth={2} aria-hidden="true" /> Reopen
        </button>
      );
    case "Rejected":
      return (
        <button
          className={`${styles.actionButton} ${styles.reopenButton}`}
          onClick={() => onUpdateStatus(id, "Pending")}
          title="Reopen task"
          aria-label={`Reopen task: ${title}`}
        >
          <RotateCcw size={18} strokeWidth={2} aria-hidden="true" /> Reopen
        </button>
      );
    default:
      return null;
  }
};

/**
 * Displays a single task as a card with status badges, action buttons,
 * inline delete confirmation, and an overdue indicator.
 *
 * Wrapped in `React.memo` to prevent re-renders when sibling tasks change.
 */
export const TaskCard: React.FC<TaskCardProps> = memo(
  ({ task, onDelete, onUpdateStatus, onEdit }) => {
    const { id, title, description, status, priority, assignedTo, dueDate } = task;

    // Two-step delete confirmation — avoids disruptive window.confirm() dialogs.
    const [pendingDelete, setPendingDelete] = useState(false);

    const taskIsOverdue = isOverdue(task);

    return (
      <article
        className={`${styles.card} ${taskIsOverdue ? styles.cardOverdue : ""}`}
        aria-label={`Task: ${title}`}
      >
        {/* Overdue warning banner */}
        {taskIsOverdue && (
          <div className={styles.overdueBanner} role="alert" aria-live="polite">
            <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" />
            Overdue
          </div>
        )}

        {/* Card Header: Priority badge + action icons */}
        <div className={styles.cardHeader}>
          {renderPriorityBadge(priority)}

          <div className={styles.headerActions}>
            {/* Edit button */}
            <button
              className={styles.editButton}
              onClick={() => onEdit(task)}
              title="Edit Task"
              aria-label={`Edit task: ${title}`}
            >
              <Pencil size={18} strokeWidth={2} aria-hidden="true" />
            </button>

            {/* Inline delete confirmation */}
            {pendingDelete ? (
              <div className={styles.deleteConfirm} role="group" aria-label="Confirm deletion">
                <span className={styles.deleteConfirmText}>Delete?</span>
                <button
                  className={`${styles.confirmButton} ${styles.confirmYes}`}
                  onClick={() => onDelete(id)}
                  aria-label="Confirm delete"
                >
                  Yes
                </button>
                <button
                  className={`${styles.confirmButton} ${styles.confirmNo}`}
                  onClick={() => setPendingDelete(false)}
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                className={styles.deleteButton}
                onClick={() => setPendingDelete(true)}
                title="Delete Task"
                aria-label={`Delete task: ${title}`}
              >
                <Trash2 size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Card Body: Title + Description */}
        <div className={styles.cardBody}>
          <h3 className={styles.title} title={title}>
            {title}
          </h3>
          <p className={styles.description} title={description}>
            {description || (
              <span className={styles.noDescription}>No description provided.</span>
            )}
          </p>
        </div>

        {/* Meta: Assignee + Due Date */}
        <div className={styles.metaInfo}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}><User size={18} strokeWidth={2} aria-hidden="true" /> Assignee</span>
            <span className={styles.metaValue} title={assignedTo}>{assignedTo}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}><Calendar size={18} strokeWidth={2} aria-hidden="true" /> Due Date</span>
            <span
              className={`${styles.metaValue} ${taskIsOverdue ? styles.metaValueOverdue : ""}`}
            >
              {formatDueDate(dueDate)}
            </span>
          </div>
        </div>

        {/* Card Footer: Status badge + Action buttons */}
        <div className={styles.cardFooter}>
          <div className={styles.badgeContainer}>
            {renderStatusBadge(status)}
          </div>

          <div className={styles.actionGroup}>
            {getActionButtons(status, id, title, onUpdateStatus, styles)}
          </div>
        </div>
      </article>
    );
  }
);

TaskCard.displayName = "TaskCard";
