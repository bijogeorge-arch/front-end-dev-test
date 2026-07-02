import React, { memo } from "react";
import styles from "./StatsBar.module.css";
import { Task, TaskStatus } from "../../types/task";
import { useTaskStats } from "../../hooks/useTaskStats";
import { ClipboardList, Clock, Play, CheckCircle, XCircle, AlertTriangle, LucideIcon } from 'lucide-react';

interface StatsBarProps {
  tasks: Task[];
  /** When set, clicking a stat card applies that status as the active filter. */
  onFilterByStatus: (status: TaskStatus | "All") => void;
  /** The currently active status filter — used to highlight the active card. */
  activeStatusFilter: TaskStatus | "All";
}

interface StatCardConfig {
  label: string;
  status: TaskStatus | "All";
  colorClass: string;
  Icon: LucideIcon;
}

const STAT_CARDS: StatCardConfig[] = [
  { label: "Total",       status: "All",         colorClass: "cardTotal",     Icon: ClipboardList },
  { label: "Pending",     status: "Pending",      colorClass: "cardPending",   Icon: Clock },
  { label: "In Progress", status: "In Progress",  colorClass: "cardProgress",  Icon: Play },
  { label: "Completed",   status: "Completed",    colorClass: "cardCompleted", Icon: CheckCircle },
  { label: "Rejected",    status: "Rejected",     colorClass: "cardRejected",  Icon: XCircle },
];

/**
 * Displays a row of clickable stat cards summarising task counts by status.
 * Clicking a card sets the active status filter in the parent.
 *
 * Uses `useTaskStats` to derive live counts via `useMemo` + `.reduce()`.
 * Wrapped in `React.memo` to avoid re-renders when non-stat props change.
 */
export const StatsBar: React.FC<StatsBarProps> = memo(
  ({ tasks, onFilterByStatus, activeStatusFilter }) => {
    const { total, counts, overdueCount } = useTaskStats(tasks);

    const getCount = (status: TaskStatus | "All"): number =>
      status === "All" ? total : (counts[status] ?? 0);

    return (
      <section className={styles.statsBar} aria-label="Task statistics">
        {STAT_CARDS.map(({ label, status, colorClass, Icon }) => {
          const isActive = activeStatusFilter === status;
          return (
            <button
              key={status}
              className={`${styles.statCard} ${styles[colorClass]} ${isActive ? styles.active : ""}`}
              onClick={() => onFilterByStatus(isActive ? "All" : status)}
              aria-pressed={isActive}
              aria-label={`Filter by ${label}: ${getCount(status)} tasks`}
              title={isActive ? `Clear ${label} filter` : `Show ${label} tasks`}
            >
              <div className={styles.iconWrapper}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className={styles.statBody}>
                <span className={styles.statCount}>{getCount(status)}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            </button>
          );
        })}

        {/* Overdue indicator — shown only when relevant */}
        {overdueCount > 0 && (
          <div
            className={`${styles.statCard} ${styles.cardOverdue}`}
            role="status"
            aria-label={`${overdueCount} overdue tasks`}
            title="Tasks past their due date"
          >
            <div className={styles.iconWrapper}>
              <AlertTriangle size={18} aria-hidden="true" />
            </div>
            <div className={styles.statBody}>
              <span className={styles.statCount}>{overdueCount}</span>
              <span className={styles.statLabel}>Overdue</span>
            </div>
          </div>
        )}
      </section>
    );
  }
);

StatsBar.displayName = "StatsBar";
