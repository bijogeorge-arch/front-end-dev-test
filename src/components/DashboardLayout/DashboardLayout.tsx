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
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile panels when ESC is pressed or on resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileFormOpen(false);
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const closeMobilePanels = () => {
    setMobileFormOpen(false);
    setMobileFiltersOpen(false);
  };

  const isAnyPanelOpen = mobileFormOpen || mobileFiltersOpen;

  return (
    <div className={styles.layoutWrapper}>
      {header}
      <div className={styles.dashboardContainer}>
        {/* Backdrop for mobile drawer */}
        {isAnyPanelOpen && (
          <div className={styles.backdrop} onClick={closeMobilePanels} />
        )}

        <aside className={`${styles.filterSidebar} ${mobileFormOpen ? styles.showForm : ''} ${mobileFiltersOpen ? styles.showFilters : ''}`}>
          {(mobileFormOpen || mobileFiltersOpen) && (
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {mobileFormOpen ? 'Create Task' : 'Filter & Sort'}
              </h3>
              <button
                className={styles.drawerCloseButton}
                onClick={closeMobilePanels}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
          )}
          <div className={styles.formSection}>
            {children}
          </div>
          <div className={styles.filterSection}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <FilterControls
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        </aside>

        <main className={styles.mainCanvas}>
          {/* Task count summary bar & Mobile controls */}
          <div className={styles.canvasToolbar}>
            <div className={styles.mobileActions}>
              <button
                className={`${styles.mobileActionButton} ${mobileFormOpen ? styles.active : ''}`}
                onClick={() => {
                  setMobileFormOpen(!mobileFormOpen);
                  setMobileFiltersOpen(false);
                }}
                aria-label="Toggle task form"
              >
                {mobileFormOpen ? '✕ Close Form' : '＋ New Task'}
              </button>
              <button
                className={`${styles.mobileActionButton} ${mobileFiltersOpen ? styles.active : ''}`}
                onClick={() => {
                  setMobileFiltersOpen(!mobileFiltersOpen);
                  setMobileFormOpen(false);
                }}
                aria-label="Toggle filters"
              >
                {mobileFiltersOpen ? '✕ Close Filters' : '🔍 Filter & Sort'}
              </button>
            </div>
            
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
