/**
 * @file dateUtils.ts
 * @description Shared date utility helpers.
 *
 * Centralised here to eliminate duplication across components that need
 * to work with local-timezone dates (TaskForm, TaskEditModal, etc.).
 */

/**
 * Returns today's date as a "YYYY-MM-DD" string in the **local** timezone.
 *
 * Using `new Date()` + manual formatting (rather than `.toISOString().slice(0,10)`)
 * avoids the UTC midnight off-by-one-day bug that can occur when the local clock
 * is behind UTC (e.g. UTC-5 at 11 PM would still be "yesterday" in UTC).
 *
 * @example
 * const min = getTodayString(); // "2026-07-02"
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
