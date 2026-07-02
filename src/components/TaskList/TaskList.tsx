import React from "react";
import styles from "./TaskList.module.css";
import { Task, TaskStatus } from "../../types/task";
import { TaskCard } from "../TaskCard/TaskCard";

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onDeleteTask: (id: number) => void;
  onUpdateTaskStatus: (id: number, status: TaskStatus) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  onDeleteTask,
  onUpdateTaskStatus,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer} id="task-list-loading">
        <div className={styles.spinner}></div>
        <div>Loading...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyContainer} id="task-list-empty">
        <div className={styles.emptyIcon}>📂</div>
        <div className={styles.emptyText}>No Tasks Available</div>
      </div>
    );
  }

  return (
    <div className={styles.grid} id="task-list-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDeleteTask}
          onUpdateStatus={onUpdateTaskStatus}
        />
      ))}
    </div>
  );
};
