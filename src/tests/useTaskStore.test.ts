/**
 * @file useTaskStore.test.ts
 * @description Unit tests for the Zustand task store.
 *
 * Tests each store action in isolation using the real Zustand store.
 * The store is reset before each test to prevent state bleed-over.
 *
 * Coverage:
 * - initializeTasks (seeds data; is a no-op when tasks exist)
 * - addTask (appends with auto-incremented id)
 * - deleteTask (removes by id)
 * - updateTaskStatus (mutates only status)
 * - updateTask (merges partial updates)
 * - reorderTasks (splice-based index move)
 * - clearAllTasks (empties array)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../store/useTaskStore';
import { mockTasks } from '../data/mockTasks';
import { Task } from '../types/task';

// Helper: reset store to empty state before each test
const resetStore = () => useTaskStore.setState({ tasks: [] });

// Minimal valid task fixture (no id / createdAt — those are added by addTask)
const makeTaskInput = (overrides: Partial<Omit<Task, 'id' | 'createdAt'>> = {}) => ({
  title: 'Test Task',
  description: 'A test description long enough.',
  status: 'Pending' as const,
  priority: 'Medium' as const,
  assignedTo: 'Alice',
  dueDate: '2026-08-01',
  ...overrides,
});

describe('useTaskStore', () => {
  beforeEach(resetStore);

  // ── initializeTasks ────────────────────────────────────────────────────────

  it('initializeTasks seeds mock data when tasks array is empty', () => {
    useTaskStore.getState().initializeTasks();
    expect(useTaskStore.getState().tasks).toHaveLength(mockTasks.length);
    expect(useTaskStore.getState().tasks[0].id).toBe(mockTasks[0].id);
  });

  it('initializeTasks is a no-op when tasks already exist', () => {
    // Pre-populate with one task
    useTaskStore.getState().addTask(makeTaskInput());
    const before = useTaskStore.getState().tasks.length;

    useTaskStore.getState().initializeTasks();

    // Should not have added mock data on top
    expect(useTaskStore.getState().tasks).toHaveLength(before);
  });

  // ── addTask ────────────────────────────────────────────────────────────────

  it('addTask appends a new task with an auto-generated id and createdAt', () => {
    useTaskStore.getState().addTask(makeTaskInput());
    const tasks = useTaskStore.getState().tasks;

    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(1);
    expect(tasks[0].title).toBe('Test Task');
    expect(tasks[0].createdAt).toBeTruthy();
  });

  it('addTask increments ids correctly for multiple tasks', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'First' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Second' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Third' }));

    const ids = useTaskStore.getState().tasks.map((t) => t.id);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('addTask preserves existing tasks and appends at the end', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'First' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Second' }));

    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].title).toBe('First');
    expect(tasks[1].title).toBe('Second');
  });

  // ── deleteTask ─────────────────────────────────────────────────────────────

  it('deleteTask removes the task with the given id', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Keep' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Delete Me' }));
    const idToDelete = useTaskStore.getState().tasks[1].id;

    useTaskStore.getState().deleteTask(idToDelete);

    const remaining = useTaskStore.getState().tasks;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].title).toBe('Keep');
  });

  it('deleteTask is a no-op for a non-existent id', () => {
    useTaskStore.getState().addTask(makeTaskInput());
    useTaskStore.getState().deleteTask(9999);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  // ── updateTaskStatus ───────────────────────────────────────────────────────

  it('updateTaskStatus changes only the status field', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Status Test' }));
    const id = useTaskStore.getState().tasks[0].id;

    useTaskStore.getState().updateTaskStatus(id, 'Completed');

    const updated = useTaskStore.getState().tasks[0];
    expect(updated.status).toBe('Completed');
    expect(updated.title).toBe('Status Test'); // unchanged
  });

  it('updateTaskStatus cycles through all status values correctly', () => {
    useTaskStore.getState().addTask(makeTaskInput());
    const id = useTaskStore.getState().tasks[0].id;

    const statuses = ['In Progress', 'Completed', 'Rejected', 'Pending'] as const;
    for (const s of statuses) {
      useTaskStore.getState().updateTaskStatus(id, s);
      expect(useTaskStore.getState().tasks[0].status).toBe(s);
    }
  });

  // ── updateTask ─────────────────────────────────────────────────────────────

  it('updateTask merges partial fields without touching others', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Original', priority: 'Low' }));
    const id = useTaskStore.getState().tasks[0].id;

    useTaskStore.getState().updateTask(id, { title: 'Updated', priority: 'High' });

    const task = useTaskStore.getState().tasks[0];
    expect(task.title).toBe('Updated');
    expect(task.priority).toBe('High');
    expect(task.assignedTo).toBe('Alice'); // unchanged
  });

  // ── reorderTasks ──────────────────────────────────────────────────────────

  it('reorderTasks moves a task from fromIndex to toIndex', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'A' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'B' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'C' }));

    // Move 'A' (index 0) to position 2 (last)
    useTaskStore.getState().reorderTasks(0, 2);

    const titles = useTaskStore.getState().tasks.map((t) => t.title);
    expect(titles).toEqual(['B', 'C', 'A']);
  });

  it('reorderTasks moving to same position is effectively a no-op in content', () => {
    useTaskStore.getState().addTask(makeTaskInput({ title: 'X' }));
    useTaskStore.getState().addTask(makeTaskInput({ title: 'Y' }));

    useTaskStore.getState().reorderTasks(0, 0);
    const titles = useTaskStore.getState().tasks.map((t) => t.title);
    expect(titles).toEqual(['X', 'Y']);
  });

  // ── clearAllTasks ──────────────────────────────────────────────────────────

  it('clearAllTasks empties the task list', () => {
    useTaskStore.getState().addTask(makeTaskInput());
    useTaskStore.getState().addTask(makeTaskInput());
    useTaskStore.getState().clearAllTasks();
    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });
});
