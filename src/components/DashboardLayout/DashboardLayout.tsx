import React, { useState, useEffect, useCallback } from 'react';
import styles from './DashboardLayout.module.css';
import { useTaskStore } from '../../store/useTaskStore';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { SearchBar } from '../SearchBar/SearchBar';
import { FilterControls } from '../Filter/FilterControls';
import { TaskList } from '../TaskList/TaskList';

interface DashboardLayoutProps {
  header: React.ReactNode;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ header, children }) => {
  const { tasks, deleteTask, updateTaskStatus } = useTaskStore();
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    filteredTasks,
  } = useTaskFilters(tasks);

  // Simulated loading flag for 500ms on mount — demonstrates useEffect + cleanup
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // useCallback — stable references for store actions passed to children
  const handleDeleteTask = useCallback(
    (id: number) => deleteTask(id),
    [deleteTask]
  );

  const handleUpdateTaskStatus = useCallback(
    (id: number, status: Parameters<typeof updateTaskStatus>[1]) =>
      updateTaskStatus(id, status),
    [updateTaskStatus]
  );

  const totalCount = tasks.length;
  const filteredCount = filteredTasks.length;
  const isFiltering = filteredCount !== totalCount;

  return (
    <div className={styles.layoutWrapper}>
      {header}
      <div className={styles.dashboardContainer}>
        <aside className={styles.filterSidebar}>
          {children}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <FilterControls
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </aside>

        <main className={styles.mainCanvas}>
          {/* Task count summary bar */}
          <div className={styles.canvasToolbar}>
            <p className={styles.taskCount} id="task-count-summary">
              {isFiltering
                ? `Showing ${filteredCount} of ${totalCount} tasks`
                : `${totalCount} task${totalCount !== 1 ? 's' : ''} total`}
            </p>
          </div>

          <div className={styles.canvasScrollContainer}>
            <TaskList
              tasks={filteredTasks}
              loading={loading}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
