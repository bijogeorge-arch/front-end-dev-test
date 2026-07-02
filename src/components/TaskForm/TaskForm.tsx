import React, { useState } from "react";
import { useTaskStore } from "../../store/useTaskStore";
import { TaskPriority, TaskStatus } from "../../types/task";
import styles from "./TaskForm.module.css";

interface FormState {
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

interface FormErrors {
  title?: string;
  assignedTo?: string;
  dueDate?: string;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  assignedTo: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
};

export const TaskForm: React.FC = () => {
  const addTask = useTaskStore((state) => state.addTask);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateField = (name: keyof FormState, value: string): string => {
    if (name === "title") {
      if (!value.trim()) return "Title is required.";
    }
    if (name === "assignedTo") {
      if (!value.trim()) return "Assigned Employee is required.";
    }
    if (name === "dueDate") {
      if (!value) return "Due Date is required.";
      const today = getTodayDateString();
      if (value < today) return "Due Date cannot point to a past date.";
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation error clearance
    const errorMsg = validateField(name as keyof FormState, value);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (!errorMsg) {
        delete nextErrors[name as keyof FormErrors];
      } else {
        nextErrors[name as keyof FormErrors] = errorMsg;
      }
      return nextErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors: FormErrors = {};
    const titleError = validateField("title", formData.title);
    const assignedToError = validateField("assignedTo", formData.assignedTo);
    const dueDateError = validateField("dueDate", formData.dueDate);

    if (titleError) newErrors.title = titleError;
    if (assignedToError) newErrors.assignedTo = assignedToError;
    if (dueDateError) newErrors.dueDate = dueDateError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call state container action
    addTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedTo: formData.assignedTo.trim(),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
    });

    // Reset fields and errors
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Create New Task</h2>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="title" className={styles.label}>
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Implement Auth Flow"
            maxLength={100}
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
          />
          {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add detailed task instructions..."
            rows={3}
            maxLength={300}
            className={styles.textarea}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="assignedTo" className={styles.label}>
              Assigned Employee *
            </label>
            <input
              type="text"
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              maxLength={60}
              className={`${styles.input} ${errors.assignedTo ? styles.inputError : ""}`}
            />
            {errors.assignedTo && <span className={styles.errorMessage}>{errors.assignedTo}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="dueDate" className={styles.label}>
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={getTodayDateString()}
              className={`${styles.input} ${errors.dueDate ? styles.inputError : ""}`}
            />
            {errors.dueDate && <span className={styles.errorMessage}>{errors.dueDate}</span>}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="priority" className={styles.label}>
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="status" className={styles.label}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Add Task
        </button>
      </form>
    </div>
  );
};
