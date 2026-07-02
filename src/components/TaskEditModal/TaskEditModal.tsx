import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import styles from "./TaskEditModal.module.css";
import { Task, TaskPriority, TaskStatus, FormErrors, TASK_STATUSES, TASK_PRIORITIES } from "../../types/task";
import { useTaskStore } from "../../store/useTaskStore";
import { getTodayString } from "../../utils/dateUtils";
import { Pencil, X } from 'lucide-react';

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
}

// getTodayString is imported from src/utils/dateUtils.ts (shared utility)

/** Validates a single field and returns an error message string (or "") */
const validateField = (name: keyof Task, value: string): string => {
  switch (name) {
    case "title":
      if (!value.trim()) return "Title is required.";
      if (value.trim().length < 3) return "Title must be at least 3 characters.";
      return "";
    case "assignedTo":
      if (!value.trim()) return "Assigned employee is required.";
      return "";
    case "dueDate":
      if (!value) return "Due date is required.";
      if (value < getTodayString()) return "Due date cannot be in the past.";
      return "";
    default:
      return "";
  }
};

/**
 * Full-screen modal for editing an existing task.
 *
 * Features:
 * - Pre-fills all fields from the task prop
 * - Real-time inline validation (same rules as TaskForm)
 * - ESC key closes the modal
 * - Focus is trapped inside the modal for accessibility
 * - useRef is used to auto-focus the title field on open
 * - React.memo prevents re-renders when unrelated tasks change
 */
export const TaskEditModal: React.FC<TaskEditModalProps> = memo(({ task, onClose }) => {
  const updateTask = useTaskStore((state) => state.updateTask);

  // Pre-fill state from the incoming task
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo,
    priority: task.priority as TaskPriority,
    status: task.status as TaskStatus,
    dueDate: task.dueDate,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // useRef — auto-focus the title input when the modal opens
  const titleInputRef = useRef<HTMLInputElement>(null);
  // useRef — the modal dialog element, used for focus trapping
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus title field on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      // Focus trapping: keep Tab inside the modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error as soon as the field becomes valid
      const errorMsg = validateField(name as keyof Task, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (!errorMsg) {
          delete next[name as keyof FormErrors];
        } else {
          next[name as keyof FormErrors] = errorMsg;
        }
        return next;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: FormErrors = {};
      const titleErr = validateField("title", formData.title);
      const assignedErr = validateField("assignedTo", formData.assignedTo);
      const dueDateErr = validateField("dueDate", formData.dueDate);

      if (titleErr) newErrors.title = titleErr;
      if (assignedErr) newErrors.assignedTo = assignedErr;
      if (dueDateErr) newErrors.dueDate = dueDateErr;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSaving(true);
      // Simulate async update (shows loading state briefly for UX polish)
      setTimeout(() => {
        updateTask(task.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          assignedTo: formData.assignedTo.trim(),
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate,
        });
        setIsSaving(false);
        onClose();
      }, 200);
    },
    [formData, task.id, updateTask, onClose]
  );

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className={styles.modal} ref={modalRef}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 id="edit-modal-title" className={styles.modalTitle}>
            <Pencil size={18} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Edit Task
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close edit modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label htmlFor="edit-title" className={styles.label}>Task Title *</label>
            <input
              ref={titleInputRef}
              type="text"
              id="edit-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
              placeholder="e.g. Implement Auth Flow"
            />
            {errors.title && <span className={styles.errorMessage} role="alert">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label htmlFor="edit-description" className={styles.label}>Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className={styles.textarea}
              placeholder="Add detailed task instructions..."
            />
          </div>

          {/* Assigned To + Due Date */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="edit-assignedTo" className={styles.label}>Assigned Employee *</label>
              <input
                type="text"
                id="edit-assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                maxLength={60}
                className={`${styles.input} ${errors.assignedTo ? styles.inputError : ""}`}
                placeholder="e.g. Jane Doe"
              />
              {errors.assignedTo && <span className={styles.errorMessage} role="alert">{errors.assignedTo}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="edit-dueDate" className={styles.label}>Due Date *</label>
              <input
                type="date"
                id="edit-dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={getTodayString()}
                className={`${styles.input} ${errors.dueDate ? styles.inputError : ""}`}
              />
              {errors.dueDate && <span className={styles.errorMessage} role="alert">{errors.dueDate}</span>}
            </div>
          </div>

          {/* Priority + Status */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="edit-priority" className={styles.label}>Priority</label>
              <select
                id="edit-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={styles.select}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="edit-status" className={styles.label}>Status</label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.formFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

TaskEditModal.displayName = "TaskEditModal";
