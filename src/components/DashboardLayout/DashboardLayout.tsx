import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './DashboardLayout.module.css';
import { Task, SortByKey } from '../../types/task';
import { useTaskContext } from '../../context/TaskContext';
import { useSearch } from '../../hooks/useSearch';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { usePagination } from '../../hooks/usePagination';
import { SearchBar } from '../SearchBar/SearchBar';
import { FilterControls } from '../Filter/FilterControls';
import { TaskList } from '../TaskList/TaskList';
import { StatsBar } from '../StatsBar/StatsBar';
import { TaskEditModal } from '../TaskEditModal/TaskEditModal';
import { TaskForm } from '../TaskForm/TaskForm';
import { Pagination } from '../Pagination/Pagination';
import { X, Plus, Search, SortAsc } from 'lucide-react';

interface DashboardLayoutProps {
  header: React.ReactNode;
}

/**
 * Root layout component that orchestrates the entire dashboard.
 *
 * Data flow:
 *   useTaskContext (useContext → TaskProvider → Zustand store)
 *     → useSearch (debounced title/assignee filter)
 *       → useTaskFilters (status/priority filter + sort)
 *         → TaskList → TaskCard
 *
 * Key hooks used:
 * - `useContext`   — via useTaskContext() to access task state/actions
 * - `useState`     — loading flag, mobile drawer state, editing task
 * - `useEffect`    — mount loading timer, ESC keydown listener, scroll-to-top on filter change
 * - `useCallback`  — stable action handlers passed down to children
 * - `useRef`       — search input focus, task grid scroll container
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ header }) => {
  // useContext — task state and actions come from TaskContext (React Context API)
  const { tasks, deleteTask, updateTaskStatus, initializeTasks, reorderTasks } = useTaskContext();

  // Seed mock data on first load (no-op if tasks already exist in localStorage)
  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  // ── Search pipeline (useSearch hook) ─────────────────────────────────────
  const { searchQuery, setSearchQuery, searchResults, inputRef: searchInputRef } =
    useSearch(tasks);

  // ── Filter + sort pipeline (useTaskFilters hook) ──────────────────────────
  const {
    filteredTasks,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    isFiltered,
    resetFilters,
  } = useTaskFilters(searchResults); // ← receives search-filtered tasks, not raw tasks

  // ── Pagination (usePagination hook) ───────────────────────────────────────
  // 6 tasks per page; auto-resets to page 1 when filteredTasks changes.
  const PAGE_SIZE = 6;
  const {
    currentItems: pagedTasks,
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    startItem,
    endItem,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(filteredTasks, PAGE_SIZE);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Sidebar accordions state
  const [createTaskOpen, setCreateTaskOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // useRef — scroll task grid to top whenever the filtered result set changes
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simulated loading state — demonstrates useEffect with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile panels on ESC key
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

  // Scroll the task grid to top whenever filteredTasks changes
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filteredTasks]);

  // Auto-focus search input on mount (demonstrates useRef usage)
  useEffect(() => {
    // Small delay lets the loading spinner finish first
    const t = setTimeout(() => searchInputRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, [searchInputRef]);

  // ── Stable action handlers ────────────────────────────────────────────────

  const handleDeleteTask = useCallback(
    (id: number) => deleteTask(id),
    [deleteTask]
  );

  const handleUpdateTaskStatus = useCallback(
    (id: number, status: Parameters<typeof updateTaskStatus>[1]) =>
      updateTaskStatus(id, status),
    [updateTaskStatus]
  );

  const handleEditTask = useCallback((task: Task) => setEditingTask(task), []);
  const handleCloseEdit = useCallback(() => setEditingTask(null), []);

  const closeMobilePanels = useCallback(() => {
    setMobileFormOpen(false);
    setMobileFiltersOpen(false);
  }, []);

  /**
   * Drag-and-drop reorder handler.
   * `TaskList` gives us the task IDs of the dragged card and the drop target.
   * We map those IDs to their current indices in the full `tasks` array so
   * `reorderTasks(fromIndex, toIndex)` can perform the splice.
   */
  const handleReorder = useCallback(
    (draggedId: number, targetId: number) => {
      const fromIndex = tasks.findIndex((t) => t.id === draggedId);
      const toIndex = tasks.findIndex((t) => t.id === targetId);
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderTasks(fromIndex, toIndex);
      }
    },
    [tasks, reorderTasks]
  );

  // ── Derived display values ────────────────────────────────────────────────
  const totalCount = tasks.length;
  const filteredCount = filteredTasks.length;
  const isAnyPanelOpen = mobileFormOpen || mobileFiltersOpen;
  const showingFiltered = filteredCount !== totalCount || searchQuery.trim() !== '';

  return (
    <div className={styles.layoutWrapper}>
      {header}

      {/* Edit modal — rendered at portal level (above everything) */}
      {editingTask && (
        <TaskEditModal task={editingTask} onClose={handleCloseEdit} />
      )}

      <div className={styles.dashboardContainer}>
        {/* Mobile drawer backdrop */}
        {isAnyPanelOpen && (
          <div
            className={styles.backdrop}
            onClick={closeMobilePanels}
            role="presentation"
            aria-hidden="true"
          />
        )}

        {/* Sidebar: Form + Search + Filters */}
        <aside
          className={`${styles.filterSidebar} ${mobileFormOpen ? styles.showForm : ''} ${mobileFiltersOpen ? styles.showFilters : ''}`}
          aria-label="Task creation and filters"
        >
          {(mobileFormOpen || mobileFiltersOpen) && (
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {mobileFormOpen ? 'Create task' : 'Filter & sort'}
              </h3>
              <button
                className={styles.drawerCloseButton}
                onClick={closeMobilePanels}
                aria-label="Close panel"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Accordion: Create task */}
          <div className={`${styles.accordion} ${styles.formSection}`}>
            <button
              className={styles.accordionHeader}
              onClick={() => setCreateTaskOpen(!createTaskOpen)}
              aria-expanded={createTaskOpen}
            >
              <span className={styles.accordionTitle}>Create task</span>
              <span className={styles.accordionIcon}>{createTaskOpen ? '▼' : '▶'}</span>
            </button>
            {createTaskOpen && (
              <div className={styles.accordionContent}>
                <TaskForm />
              </div>
            )}
          </div>

          {/* Accordion: Search tasks */}
          <div className={`${styles.accordion} ${styles.filterSection}`}>
            <button
              className={styles.accordionHeader}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-expanded={searchOpen}
            >
              <span className={styles.accordionTitle}>Search tasks</span>
              <span className={styles.accordionIcon}>{searchOpen ? '▼' : '▶'}</span>
            </button>
            {searchOpen && (
              <div className={styles.accordionContent}>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  inputRef={searchInputRef}
                  resultCount={searchQuery ? searchResults.length : undefined}
                />
              </div>
            )}
          </div>

          {/* Accordion: Filters */}
          <div className={`${styles.accordion} ${styles.filterSection}`}>
            <button
              className={styles.accordionHeader}
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <span className={styles.accordionTitle}>Filters</span>
              <span className={styles.accordionIcon}>{filtersOpen ? '▼' : '▶'}</span>
            </button>
            {filtersOpen && (
              <div className={styles.accordionContent}>
                <FilterControls
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  priorityFilter={priorityFilter}
                  setPriorityFilter={setPriorityFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  isFiltered={isFiltered}
                  resetFilters={resetFilters}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Main canvas */}
        <main className={styles.mainCanvas}>
          {/* Stats bar */}
          <StatsBar
            tasks={tasks}
            onFilterByStatus={setStatusFilter}
            activeStatusFilter={statusFilter}
          />

          {/* Tasks section header */}
          <div className={styles.tasksHeader}>
            <div className={styles.mobileActions}>
              <button
                className={`${styles.mobileActionButton} ${mobileFormOpen ? styles.active : ''}`}
                onClick={() => {
                  setMobileFormOpen((v) => !v);
                  setMobileFiltersOpen(false);
                }}
                aria-label="Toggle task form"
                aria-expanded={mobileFormOpen}
              >
                {mobileFormOpen
                  ? <><X size={14} aria-hidden="true" /> Close</>
                  : <><Plus size={14} aria-hidden="true" /> New Task</>
                }
              </button>
              <button
                className={`${styles.mobileActionButton} ${mobileFiltersOpen ? styles.active : ''}`}
                onClick={() => {
                  setMobileFiltersOpen((v) => !v);
                  setMobileFormOpen(false);
                }}
                aria-label="Toggle filters"
                aria-expanded={mobileFiltersOpen}
              >
                {mobileFiltersOpen
                  ? <><X size={14} aria-hidden="true" /> Close</>
                  : <><Search size={14} aria-hidden="true" /> Filter</>
                }
              </button>
            </div>

            <h2 className={styles.tasksTitle}>Tasks</h2>

            <div className={styles.tasksHeaderRight}>
              <p
                className={styles.taskCount}
                id="task-count-summary"
                aria-live="polite"
                aria-atomic="true"
              >
                {showingFiltered
                  ? `${filteredCount} of ${totalCount} task${totalCount !== 1 ? 's' : ''}`
                  : `${totalCount} task${totalCount !== 1 ? 's' : ''} total`}
              </p>
              <div className={styles.sortWrapper}>
                <SortAsc size={14} aria-hidden="true" className={styles.sortIcon} />
                <label htmlFor="sort-inline" className={styles.sortLabel}>Sort by:</label>
                <select
                  id="sort-inline"
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortByKey)}
                  aria-label="Sort tasks"
                >
                  <option value="none">Default</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task grid */}
          <div className={styles.canvasScrollContainer} ref={scrollContainerRef}>
            <TaskList
              tasks={pagedTasks}
              loading={loading}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onEditTask={handleEditTask}
              onReorder={handleReorder}
            />
            {/* Pagination control */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              startItem={startItem}
              endItem={endItem}
              totalItems={totalItems}
              onPrev={prevPage}
              onNext={nextPage}
              onGoToPage={goToPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
