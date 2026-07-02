import { Task } from "../types/task";

export const initialTasks: Task[] = [
  {
    id: 1,
    title: "Design Landing Page Hero Section",
    description: "Create high-fidelity mockups for the new landing page hero section focusing on the primary value proposition.",
    status: "In Progress",
    priority: "High",
    assignedTo: "Sarah Jenkins",
    dueDate: "2026-07-05",
  },
  {
    id: 2,
    title: "Database Migration Script",
    description: "Write and test database migration scripts to transition employee schemas to v2 without downtime.",
    status: "Pending",
    priority: "High",
    assignedTo: "David Chen",
    dueDate: "2026-07-10",
  },
  {
    id: 3,
    title: "Update API Documentation",
    description: "Refactor Swagger specs to document new authentication endpoints and token refresh mechanics.",
    status: "Completed",
    priority: "Medium",
    assignedTo: "Elena Rostova",
    dueDate: "2026-06-30",
  },
  {
    id: 4,
    title: "Configure CI/CD Pipeline",
    description: "Integrate automated security scanning step into GitHub Actions workflow.",
    status: "Pending",
    priority: "Low",
    assignedTo: "Marcus Aurelius",
    dueDate: "2026-07-15",
  },
  {
    id: 5,
    title: "Refactor Notification Panel",
    description: "Clean up legacy state handlers in the notifications component and implement virtualization.",
    status: "Rejected",
    priority: "Medium",
    assignedTo: "Lisa Kudrow",
    dueDate: "2026-07-01",
  },
];
