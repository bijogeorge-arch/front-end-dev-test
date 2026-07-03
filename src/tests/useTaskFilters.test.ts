/**
 * @file useTaskFilters.test.ts
 * @description Unit tests for the useTaskFilters custom hook.
 *
 * Tests the filter/sort pipeline in isolation using `renderHook`.
 *
 * Coverage:
 * - Returns all tasks when no filter is active
 * - Filters by status correctly
 * - Filters by priority correctly
 * - Applies both status and priority filters simultaneously (AND logic)
 * - Sorts by dueDate ascending
 * - Sorts by priority descending (High > Medium > Low)
 * - isFiltered flag is true only when a non-default filter is active
 * - resetFilters clears all state back to defaults
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { Task } from '../types/task';

// ── Fixture data ──────────────────────────────────────────────────────────────

const makeMockTask = (overrides: Partial<Task>): Task => ({
  id: 1,
  title: 'Task',
  description: 'desc',
  status: 'Pending',
  priority: 'Medium',
  assignedTo: 'Alice',
  dueDate: '2026-08-01',
  createdAt: '2026-07-01T00:00:00.000Z',
  ...overrides,
});

const tasks: Task[] = [
  makeMockTask({ id: 1, status: 'Pending',     priority: 'Low',    dueDate: '2026-08-10' }),
  makeMockTask({ id: 2, status: 'In Progress', priority: 'High',   dueDate: '2026-07-20' }),
  makeMockTask({ id: 3, status: 'Completed',   priority: 'Medium', dueDate: '2026-07-15' }),
  makeMockTask({ id: 4, status: 'Rejected',    priority: 'High',   dueDate: '2026-08-05' }),
  makeMockTask({ id: 5, status: 'Pending',     priority: 'High',   dueDate: '2026-07-25' }),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTaskFilters', () => {

  it('returns all tasks when no filters are applied', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));
    expect(result.current.filteredTasks).toHaveLength(tasks.length);
  });

  it('filters by status correctly', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => result.current.setStatusFilter('Pending'));

    expect(result.current.filteredTasks).toHaveLength(2);
    expect(result.current.filteredTasks.every((t) => t.status === 'Pending')).toBe(true);
  });

  it('filters by priority correctly', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => result.current.setPriorityFilter('High'));

    expect(result.current.filteredTasks).toHaveLength(3);
    expect(result.current.filteredTasks.every((t) => t.priority === 'High')).toBe(true);
  });

  it('applies both status and priority filters with AND logic', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => {
      result.current.setStatusFilter('Pending');
      result.current.setPriorityFilter('High');
    });

    // Only task id:5 has Pending + High
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe(5);
  });

  it('returns empty array when filter matches nothing', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => {
      result.current.setStatusFilter('Completed');
      result.current.setPriorityFilter('Low');
    });

    expect(result.current.filteredTasks).toHaveLength(0);
  });

  it('sorts by dueDate ascending', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => result.current.setSortBy('dueDate'));

    const dates = result.current.filteredTasks.map((t) => t.dueDate);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('sorts by priority descending (High first)', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => result.current.setSortBy('priority'));

    const priorities = result.current.filteredTasks.map((t) => t.priority);
    // High should appear before Medium, Medium before Low
    const highIdx = priorities.indexOf('High');
    const medIdx = priorities.indexOf('Medium');
    const lowIdx = priorities.indexOf('Low');
    expect(highIdx).toBeLessThan(medIdx);
    expect(medIdx).toBeLessThan(lowIdx);
  });

  it('isFiltered is false by default', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));
    expect(result.current.isFiltered).toBe(false);
  });

  it('isFiltered is true when a status filter is active', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));
    act(() => result.current.setStatusFilter('Completed'));
    expect(result.current.isFiltered).toBe(true);
  });

  it('isFiltered is true when a sort is active', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));
    act(() => result.current.setSortBy('dueDate'));
    expect(result.current.isFiltered).toBe(true);
  });

  it('resetFilters restores all defaults', () => {
    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => {
      result.current.setStatusFilter('Pending');
      result.current.setPriorityFilter('High');
      result.current.setSortBy('priority');
    });
    expect(result.current.isFiltered).toBe(true);

    act(() => result.current.resetFilters());

    expect(result.current.statusFilter).toBe('All');
    expect(result.current.priorityFilter).toBe('All');
    expect(result.current.sortBy).toBe('none');
    expect(result.current.isFiltered).toBe(false);
    expect(result.current.filteredTasks).toHaveLength(tasks.length);
  });
});
