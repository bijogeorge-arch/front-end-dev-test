import React, { useState, useCallback } from "react";
import { useTaskStore } from "../../store/useTaskStore";
import { TaskPriority, TaskStatus, FormErrors, TASK_STATUSES, TASK_PRIORITIES } from "../../types/task";
import { getTodayString } from "../../utils/dateUtils";
import styles from "./TaskForm.module.css";
import { Plus, CheckCircle, ClipboardList } from 'lucide-react';

/**
 * @file TaskForm.tsx
 * @description Controlled form for creating new tasks.
 *
 * - `FormErrors` is imported from `types/task.ts` — single source of truth.
 * - `TASK_STATUSES` / `TASK_PRIORITIES` constants are used for <option> rendering (DRY).
 * - Real-time per-field validation on change + full validation on submit.
 * - `useCallback` on handlers to maintain stable references.
 */

interface FormState {
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  assignedTo: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
};

// getTodayString is imported from src/utils/dateUtils.ts (shared utility)

/** Returns a validation error message, or "" if the field is valid. */
const validateField = (name: keyof FormState, value: string): string => {
  if (name === "title") {
    if (!value.trim()) return "Title is required.";
    if (value.trim().length < 3) return "Title must be at least 3 characters.";
  }
  if (name === "assignedTo") {
    if (!value.trim()) return "Assigned employee is required.";
  }
  if (name === "dueDate") {
    if (!value) return "Due date is required.";
    if (value < getTodayString()) return "Due date cannot be in the past.";
  }
  return "";
};

export const TaskForm: React.FC = () => {
  const addTask = useTaskStore((state) => state.addTask);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setSuccess(false);

      // Real-time validation — clear error as soon as the field is valid
      const errorMsg = validateField(name as keyof FormState, value);
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

      // Validate all required fields on submit
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

      addTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: formData.assignedTo.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
      });

      setFormData(initialFormState);
      setErrors({});
      setSuccess(true);
    },
    [formData, addTask]
  );

  return (
    <div className={styles.formContainer}>
      {/* Form header with icon, title and subtitle */}
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon}>
          <ClipboardList size={16} aria-hidden="true" />
        </div>
        <div>
          <h2 className={styles.formTitle}>Create New Task</h2>
          <p className={styles.formSubtitle}>Add task details and assign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate aria-label="Create task form">
        {/* Title */}
        <div className={styles.fieldGroup}>
          <label htmlFor="title" className={styles.label}>Task Title <span className={styles.required}>*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Implement Auth Flow"
            maxLength={100}
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <span id="title-error" className={styles.errorMessage} role="alert">{errors.title}</span>
          )}
        </div>

        {/* Description with character counter */}
        <div className={styles.fieldGroup}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add detailed task instructions..."
            rows={3}
            maxLength={500}
            className={styles.textarea}
          />
          <span className={styles.charCount}>{formData.description.length}/500</span>
        </div>

        {/* Assigned Employee */}
        <div className={styles.fieldGroup}>
          <label htmlFor="assignedTo" className={styles.label}>Assigned Employee <span className={styles.required}>*</span></label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            maxLength={60}
            className={`${styles.input} ${errors.assignedTo ? styles.inputError : ""}`}
            aria-describedby={errors.assignedTo ? "assignedTo-error" : undefined}
            aria-invalid={!!errors.assignedTo}
          />
          {errors.assignedTo && (
            <span id="assignedTo-error" className={styles.errorMessage} role="alert">{errors.assignedTo}</span>
          )}
        </div>

        {/* Due Date */}
        <div className={styles.fieldGroup}>
          <label htmlFor="dueDate" className={styles.label}>Due Date <span className={styles.required}>*</span></label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={getTodayString()}
            className={`${styles.input} ${errors.dueDate ? styles.inputError : ""}`}
            aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
            aria-invalid={!!errors.dueDate}
          />
          {errors.dueDate && (
            <span id="dueDate-error" className={styles.errorMessage} role="alert">{errors.dueDate}</span>
          )}
        </div>

        {/* Priority + Status */}
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="priority" className={styles.label}>Priority</label>
            <select
              id="priority"
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
            <label htmlFor="status" className={styles.label}>Initial Status</label>
            <select
              id="status"
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

        <button type="submit" className={styles.submitButton}>
          <Plus size={16} aria-hidden="true" />
          Add Task
        </button>

        {/* Success feedback */}
        {success && (
          <p className={styles.successMessage} role="status" aria-live="polite">
            <CheckCircle size={16} aria-hidden="true" />
            Task created successfully!
          </p>
        )}
      </form>
    </div>
  );
};
