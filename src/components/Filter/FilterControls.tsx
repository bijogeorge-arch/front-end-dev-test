import React, { memo } from "react";
import styles from "./FilterControls.module.css";
import { TaskStatus, TaskPriority, SortByKey, TASK_STATUSES, TASK_PRIORITIES } from "../../types/task";
import { X, RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  statusFilter: TaskStatus | "All";
  setStatusFilter: (status: TaskStatus | "All") => void;
  priorityFilter: TaskPriority | "All";
  setPriorityFilter: (priority: TaskPriority | "All") => void;
  sortBy: SortByKey;
  setSortBy: (sortBy: SortByKey) => void;
  isFiltered: boolean;
  resetFilters: () => void;
}

/**
 * Renders filter selects and sort controls, plus active-filter pill chips.
 *
 * - Uses `TASK_STATUSES` / `TASK_PRIORITIES` constants for `<option>` rendering (DRY).
 * - Shows dismissible pill chips for any active filter.
 * - `resetFilters` one-click clears all selections.
 * - Wrapped in `React.memo` — re-renders only when filter props change.
 */
export const FilterControls: React.FC<FilterControlsProps> = memo(
  ({
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    isFiltered,
    resetFilters,
  }) => {
    return (
      <div className={styles.controlsContainer}>
        <div className={styles.controlsHeader}>
          <span className={styles.controlsTitle}>Filters &amp; Sort</span>
        </div>

        {/* Active filter pills */}
        {isFiltered && (
          <div className={styles.activePills} aria-label="Active filters">
            {statusFilter !== "All" && (
              <button
                className={styles.pill}
                onClick={() => setStatusFilter("All")}
                aria-label={`Remove status filter: ${statusFilter}`}
              >
                {statusFilter} <X size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }} />
              </button>
            )}
            {priorityFilter !== "All" && (
              <button
                className={styles.pill}
                onClick={() => setPriorityFilter("All")}
                aria-label={`Remove priority filter: ${priorityFilter}`}
              >
                {priorityFilter} priority <X size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }} />
              </button>
            )}
            {sortBy !== "none" && (
              <button
                className={styles.pill}
                onClick={() => setSortBy("none")}
                aria-label="Remove sort"
              >
                Sort: {sortBy === "dueDate" ? "Due Date" : "Priority"} <X size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }} />
              </button>
            )}
          </div>
        )}

        {/* Status filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter" className={styles.label}>Status</label>
          <select
            id="status-filter"
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "All")}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Priority filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter" className={styles.label}>Priority</label>
          <select
            id="priority-filter"
            className={styles.select}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "All")}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Sort control */}
        <div className={styles.filterGroup}>
          <label htmlFor="sort-by" className={styles.label}>Sort By</label>
          <select
            id="sort-by"
            className={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByKey)}
            aria-label="Sort tasks"
          >
            <option value="none">Default Order</option>
            <option value="dueDate">Due Date (Soonest First)</option>
            <option value="priority">Priority (High → Low)</option>
          </select>
        </div>

        {/* Clear Filters button — always visible, faded when not filtered */}
        <button
          className={`${styles.clearButton} ${!isFiltered ? styles.clearButtonDisabled : ''}`}
          onClick={resetFilters}
          aria-label="Reset all filters and sorting"
          id="reset-filters-btn"
          disabled={!isFiltered}
        >
          <RotateCcw size={13} aria-hidden="true" />
          Clear Filters
        </button>
      </div>
    );
  }
);

FilterControls.displayName = "FilterControls";
