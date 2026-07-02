import React from "react";
import styles from "./FilterControls.module.css";
import { TaskStatus, TaskPriority } from "../../types/task";
import { SortByKey } from "../../hooks/useTaskFilters";

interface FilterControlsProps {
  statusFilter: TaskStatus | "All";
  setStatusFilter: (status: TaskStatus | "All") => void;
  priorityFilter: TaskPriority | "All";
  setPriorityFilter: (priority: TaskPriority | "All") => void;
  sortBy: SortByKey;
  setSortBy: (sortBy: SortByKey) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
}) => {
  const isFiltered =
    statusFilter !== "All" || priorityFilter !== "All" || sortBy !== "none";

  const handleReset = () => {
    setStatusFilter("All");
    setPriorityFilter("All");
    setSortBy("none");
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsHeader}>
        <span className={styles.controlsTitle}>Filters</span>
        {isFiltered && (
          <button
            className={styles.resetButton}
            onClick={handleReset}
            aria-label="Reset all filters"
            id="reset-filters-btn"
          >
            ↺ Reset
          </button>
        )}
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="status-filter" className={styles.label}>
          Status
        </label>
        <select
          id="status-filter"
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "All")}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="priority-filter" className={styles.label}>
          Priority
        </label>
        <select
          id="priority-filter"
          className={styles.select}
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as TaskPriority | "All")
          }
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="sort-by" className={styles.label}>
          Sort By
        </label>
        <select
          id="sort-by"
          className={styles.select}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortByKey)}
        >
          <option value="none">Default (None)</option>
          <option value="dueDate">Due Date (Earliest)</option>
          <option value="priority">Priority (High → Low)</option>
        </select>
      </div>
    </div>
  );
};
