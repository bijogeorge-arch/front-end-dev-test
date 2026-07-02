import React, { useState } from "react";
import styles from "./TaskCard.module.css";
import { Task, TaskPriority, TaskStatus } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: TaskStatus) => void;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a human-readable format.
 * The 'T00:00:00' suffix forces local-timezone parsing to avoid UTC off-by-one-day issues.
 */
const formatDueDate = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDelete,
  onUpdateStatus,
}) => {
  const { id, title, description, status, priority, assignedTo, dueDate } = task;

  // Inline delete confirmation state — avoids disruptive window.confirm()
  const [pendingDelete, setPendingDelete] = useState(false);

  // ─── Switch-case: Status Badge Rendering ────────────────────────────────
  const renderStatusBadge = (taskStatus: TaskStatus) => {
    switch (taskStatus) {
      case "Pending":
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            Pending
          </span>
        );
      case "In Progress":
        return (
          <span className={`${styles.badge} ${styles.badgeInProgress}`}>
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className={`${styles.badge} ${styles.badgeCompleted}`}>
            Completed
          </span>
        );
      case "Rejected":
        return (
          <span className={`${styles.badge} ${styles.badgeRejected}`}>
            Rejected
          </span>
        );
      default:
        return <span className={styles.badge}>{taskStatus}</span>;
    }
  };

  // ─── Switch-case: Priority Badge Rendering ───────────────────────────────
  const renderPriorityBadge = (taskPriority: TaskPriority) => {
    switch (taskPriority) {
      case "High":
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>
            High
          </span>
        );
      case "Medium":
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityMedium}`}>
            Medium
          </span>
        );
      case "Low":
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityLow}`}>
            Low
          </span>
        );
      default:
        return <span className={styles.priorityBadge}>{taskPriority}</span>;
    }
  };

  // ─── Switch-case: Next status in progression cycle ───────────────────────
  const handleAdvanceStatus = () => {
    switch (status) {
      case "Pending":
        onUpdateStatus(id, "In Progress");
        break;
      case "In Progress":
        onUpdateStatus(id, "Completed");
        break;
      case "Completed":
      case "Rejected":
        onUpdateStatus(id, "Pending");
        break;
      default:
        break;
    }
  };

  // ─── Switch-case: Progress button label ─────────────────────────────────
  const getProgressButtonLabel = (): string => {
    switch (status) {
      case "Pending":
        return "⚡ Start";
      case "In Progress":
        return "✓ Complete";
      case "Completed":
      case "Rejected":
        return "↺ Reopen";
      default:
        return "Advance";
    }
  };

  const handleReject = () => {
    onUpdateStatus(id, "Rejected");
  };

  return (
    <div className={styles.card}>
      {/* Card Header: Priority badge + Delete control */}
      <div className={styles.cardHeader}>
        {renderPriorityBadge(priority)}

        {/* Inline delete confirmation — no window.confirm() required */}
        {pendingDelete ? (
          <div className={styles.deleteConfirm}>
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
            aria-label="Delete Task"
          >
            🗑
          </button>
        )}
      </div>

      {/* Card Body: Title + Description */}
      <div className={styles.cardBody}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>
        <p className={styles.description} title={description}>
          {description || <span className={styles.noDescription}>No description provided.</span>}
        </p>
      </div>

      {/* Meta: Assignee + Due Date */}
      <div className={styles.metaInfo}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>👤 Assignee:</span>
          <span className={styles.metaValue}>{assignedTo}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>📅 Due:</span>
          <span className={styles.metaValue}>{formatDueDate(dueDate)}</span>
        </div>
      </div>

      {/* Card Footer: Status badge + Action buttons */}
      <div className={styles.cardFooter}>
        <div className={styles.badgeContainer}>
          {renderStatusBadge(status)}
        </div>

        <div className={styles.actionGroup}>
          {status !== "Completed" && status !== "Rejected" && (
            <button
              className={`${styles.actionButton} ${styles.rejectButton}`}
              onClick={handleReject}
              title="Reject Task"
              aria-label="Reject Task"
            >
              ✕ Reject
            </button>
          )}
          <button
            className={`${styles.actionButton} ${styles.progressButton}`}
            onClick={handleAdvanceStatus}
            title={`Transition task to ${
              status === "Pending"
                ? "In Progress"
                : status === "In Progress"
                ? "Completed"
                : "Pending"
            }`}
            aria-label={getProgressButtonLabel()}
          >
            {getProgressButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};
