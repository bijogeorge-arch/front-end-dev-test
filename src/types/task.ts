export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Rejected";

export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
}
