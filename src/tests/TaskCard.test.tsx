/**
 * @file TaskCard.test.tsx
 * @description Unit tests for the TaskCard React component.
 *
 * Uses @testing-library/react to render into jsdom and make assertions
 * about the rendered output. Tests simulate user interaction (clicks)
 * to verify callbacks are called with the correct arguments.
 *
 * Coverage:
 * - Renders title, description, assignee, and due date
 * - Renders the correct priority badge
 * - Renders the correct status badge via the switch-case renderStatusBadge()
 * - Shows the overdue banner for past-due tasks that are not Completed/Rejected
 * - Does NOT show the overdue banner for Completed or Rejected tasks
 * - Shows the inline delete confirmation on trash click (two-step UX)
 * - Calls onDelete with the correct id after confirming deletion
 * - Cancels delete when "No" is clicked
 * - Calls onEdit with the task object when the edit button is clicked
 * - Calls onUpdateStatus with correct status when action buttons are pressed
 */
// React is provided automatically by the react-jsx transform; no explicit import needed.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../components/TaskCard/TaskCard';
import { Task } from '../types/task';

// CSS Modules are returned as proxy objects by Vitest's jsdom environment.
// We mock the module so class lookups don't throw.
// IMPORTANT: The factory function must be self-contained — vi.mock is hoisted
// to the top of the file by Vitest, so no outer variables can be referenced.
vi.mock('../components/TaskCard/TaskCard.module.css', () => ({
  default: new Proxy({}, { get: (_t, key) => String(key) }),
}));

// ── Fixture ───────────────────────────────────────────────────────────────────

const futureDate = '2099-12-31';
const pastDate = '2000-01-01';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 42,
  title: 'Fix login bug',
  description: 'Users cannot log in on Firefox.',
  status: 'Pending',
  priority: 'High',
  assignedTo: 'Alice',
  dueDate: futureDate,
  createdAt: '2026-07-01T00:00:00.000Z',
  ...overrides,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderCard = (task: Task = makeTask()) => {
  const onDelete = vi.fn();
  const onUpdateStatus = vi.fn();
  const onEdit = vi.fn();

  render(
    <TaskCard
      task={task}
      onDelete={onDelete}
      onUpdateStatus={onUpdateStatus}
      onEdit={onEdit}
    />
  );

  return { onDelete, onUpdateStatus, onEdit };
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TaskCard', () => {

  it('renders the task title', () => {
    renderCard();
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
  });

  it('renders the task description', () => {
    renderCard();
    expect(screen.getByText('Users cannot log in on Firefox.')).toBeInTheDocument();
  });

  it('renders the assignee name', () => {
    renderCard();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders the HIGH priority badge', () => {
    renderCard(makeTask({ priority: 'High' }));
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
  });

  it('renders the MEDIUM priority badge', () => {
    renderCard(makeTask({ priority: 'Medium' }));
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
  });

  it('renders the LOW priority badge', () => {
    renderCard(makeTask({ priority: 'Low' }));
    expect(screen.getByText(/LOW/i)).toBeInTheDocument();
  });

  it('renders the status label text (switch-case renderStatusBadge)', () => {
    renderCard(makeTask({ status: 'In Progress' }));
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders "Completed" status label', () => {
    renderCard(makeTask({ status: 'Completed' }));
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders "Rejected" status label', () => {
    renderCard(makeTask({ status: 'Rejected' }));
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  // ── Overdue banner ─────────────────────────────────────────────────────────

  it('shows the overdue banner for a past-due Pending task', () => {
    renderCard(makeTask({ dueDate: pastDate, status: 'Pending' }));
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('does NOT show the overdue banner for a Completed task even if past due', () => {
    renderCard(makeTask({ dueDate: pastDate, status: 'Completed' }));
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it('does NOT show the overdue banner for a Rejected task even if past due', () => {
    renderCard(makeTask({ dueDate: pastDate, status: 'Rejected' }));
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it('does NOT show the overdue banner for a future-due task', () => {
    renderCard(makeTask({ dueDate: futureDate, status: 'Pending' }));
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  // ── Delete confirmation flow ───────────────────────────────────────────────

  it('shows inline delete confirmation on trash icon click', () => {
    renderCard();
    const deleteBtn = screen.getByLabelText(/delete task: fix login bug/i);
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm delete')).toBeInTheDocument();
    expect(screen.getByLabelText('Cancel delete')).toBeInTheDocument();
  });

  it('calls onDelete with task id after confirming deletion', () => {
    const { onDelete } = renderCard();
    fireEvent.click(screen.getByLabelText(/delete task: fix login bug/i));
    fireEvent.click(screen.getByLabelText('Confirm delete'));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(42);
  });

  it('cancels deletion when "No" is clicked', () => {
    const { onDelete } = renderCard();
    fireEvent.click(screen.getByLabelText(/delete task: fix login bug/i));
    fireEvent.click(screen.getByLabelText('Cancel delete'));
    expect(onDelete).not.toHaveBeenCalled();
    // Trash button should be visible again
    expect(screen.getByLabelText(/delete task: fix login bug/i)).toBeInTheDocument();
  });

  // ── Edit callback ──────────────────────────────────────────────────────────

  it('calls onEdit with the task object when edit button is clicked', () => {
    const task = makeTask();
    const { onEdit } = renderCard(task);
    fireEvent.click(screen.getByLabelText(/edit task: fix login bug/i));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(task);
  });

  // ── Status action buttons ──────────────────────────────────────────────────

  it('calls onUpdateStatus("In Progress") when Start is clicked on a Pending task', () => {
    const { onUpdateStatus } = renderCard(makeTask({ status: 'Pending' }));
    fireEvent.click(screen.getByLabelText(/start task: fix login bug/i));
    expect(onUpdateStatus).toHaveBeenCalledWith(42, 'In Progress');
  });

  it('calls onUpdateStatus("Completed") when Complete is clicked on an In Progress task', () => {
    const { onUpdateStatus } = renderCard(makeTask({ status: 'In Progress' }));
    fireEvent.click(screen.getByLabelText(/complete task: fix login bug/i));
    expect(onUpdateStatus).toHaveBeenCalledWith(42, 'Completed');
  });

  it('calls onUpdateStatus("Rejected") when Reject is clicked on a Pending task', () => {
    const { onUpdateStatus } = renderCard(makeTask({ status: 'Pending' }));
    fireEvent.click(screen.getByLabelText(/reject task: fix login bug/i));
    expect(onUpdateStatus).toHaveBeenCalledWith(42, 'Rejected');
  });

  it('calls onUpdateStatus("Pending") when Reopen is clicked on a Completed task', () => {
    const { onUpdateStatus } = renderCard(makeTask({ status: 'Completed' }));
    fireEvent.click(screen.getByLabelText(/reopen task: fix login bug/i));
    expect(onUpdateStatus).toHaveBeenCalledWith(42, 'Pending');
  });

  it('calls onUpdateStatus("Pending") when Reopen is clicked on a Rejected task', () => {
    const { onUpdateStatus } = renderCard(makeTask({ status: 'Rejected' }));
    fireEvent.click(screen.getByLabelText(/reopen task: fix login bug/i));
    expect(onUpdateStatus).toHaveBeenCalledWith(42, 'Pending');
  });
});
