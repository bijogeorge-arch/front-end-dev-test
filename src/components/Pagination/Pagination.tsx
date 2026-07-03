import React, { memo } from "react";
import styles from "./Pagination.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  startItem: number;
  endItem: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
}

/**
 * Renders a pagination control bar with prev/next buttons and page number pills.
 *
 * - Shows at most 7 page pills (with ellipsis for large page counts).
 * - Fully accessible: aria-label, aria-current, aria-disabled attributes.
 * - Hidden entirely when there is only 1 page.
 *
 * Wrapped in `React.memo` — only re-renders when pagination state changes.
 */
export const Pagination: React.FC<PaginationProps> = memo(
  ({
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    startItem,
    endItem,
    totalItems,
    onPrev,
    onNext,
    onGoToPage,
  }) => {
    // No pagination UI needed for a single page
    if (totalPages <= 1) return null;

    /**
     * Build the visible page number sequence.
     * Always shows first, last, current ±1, and fills with ellipsis where needed.
     * Max 7 pills are shown at once.
     */
    const buildPageRange = (): (number | "...")[] => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const pages: (number | "...")[] = [];
      const surroundStart = Math.max(2, currentPage - 1);
      const surroundEnd = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);

      if (surroundStart > 2) pages.push("...");

      for (let i = surroundStart; i <= surroundEnd; i++) {
        pages.push(i);
      }

      if (surroundEnd < totalPages - 1) pages.push("...");

      pages.push(totalPages);

      return pages;
    };

    const pageRange = buildPageRange();

    return (
      <nav
        className={styles.pagination}
        aria-label="Task list pagination"
        id="pagination-nav"
      >
        {/* Item count summary */}
        <p className={styles.summary} aria-live="polite" aria-atomic="true">
          Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{" "}
          <strong>{totalItems}</strong> task{totalItems !== 1 ? "s" : ""}
        </p>

        <div className={styles.controls}>
          {/* Previous page */}
          <button
            className={`${styles.navButton} ${!hasPrevPage ? styles.disabled : ""}`}
            onClick={onPrev}
            disabled={!hasPrevPage}
            aria-label="Previous page"
            id="pagination-prev"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          {/* Page number pills */}
          <div className={styles.pages} role="list">
            {pageRange.map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className={styles.ellipsis}
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  className={`${styles.pageButton} ${
                    item === currentPage ? styles.activePage : ""
                  }`}
                  onClick={() => onGoToPage(item as number)}
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  id={`pagination-page-${item}`}
                  role="listitem"
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* Next page */}
          <button
            className={`${styles.navButton} ${!hasNextPage ? styles.disabled : ""}`}
            onClick={onNext}
            disabled={!hasNextPage}
            aria-label="Next page"
            id="pagination-next"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";
