import React from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className={styles.searchContainer}>
      <label htmlFor="task-search-input" className={styles.searchLabel}>
        Search Tasks
      </label>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          id="task-search-input"
          type="text"
          className={styles.searchInput}
          placeholder="Search by title or assignee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
