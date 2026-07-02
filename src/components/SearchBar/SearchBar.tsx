import React, { memo } from "react";
import styles from "./SearchBar.module.css";
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  /** Optional ref forwarded to the underlying <input> for imperative focus control. */
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Number of results matching the current query — drives the aria-live announcement. */
  resultCount?: number;
}

/**
 * Debounced search input with clear button and screen-reader result announcement.
 *
 * The `inputRef` prop is wired to the underlying `<input>` element so that parent
 * components can call `inputRef.current.focus()` without breaking React's
 * unidirectional data flow.
 *
 * Wrapped in `React.memo` — re-renders only when `searchQuery` or `resultCount` changes.
 */
export const SearchBar: React.FC<SearchBarProps> = memo(
  ({ searchQuery, setSearchQuery, inputRef, resultCount }) => {
    return (
      <div className={styles.searchContainer}>
        <label htmlFor="task-search-input" className={styles.searchLabel}>
          Search tasks
        </label>
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            id="task-search-input"
            type="search"
            className={styles.searchInput}
            placeholder="Search by title or assignee…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-label="Search tasks by title or assignee"
          />
          {searchQuery ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <span className={styles.shortcutHint} aria-hidden="true">
              {typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
            </span>
          )}
        </div>

        {/* aria-live region: announces result count to screen readers after debounce */}
        <p
          className={styles.resultCount}
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          {searchQuery && resultCount !== undefined
            ? `${resultCount} result${resultCount !== 1 ? "s" : ""} found`
            : ""}
        </p>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
