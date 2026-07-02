import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus } from "../types/task";
import { initialTasks } from "../data/mockTasks";

export interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  deleteTask: (id: number) => void;
  updateTaskStatus: (id: number, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      addTask: (newTask) =>
        set((state) => {
          const maxId = state.tasks.reduce((max, task) => (task.id > max ? task.id : max), 0);
          const taskWithId: Task = {
            ...newTask,
            id: maxId + 1,
          };
          return {
            tasks: [...state.tasks, taskWithId],
          };
        }),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        })),
    }),
    {
      name: "employee-task-dashboard",
    }
  )
);
