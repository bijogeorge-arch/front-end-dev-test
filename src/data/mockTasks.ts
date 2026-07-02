/**
 * @file mockTasks.ts
 * @description Realistic seed data for the Employee Task Management Dashboard.
 *
 * Contains 10 tasks with diverse statuses (Pending / In Progress / Completed / Rejected),
 * mixed priorities, real employee names, and due dates spanning ~30-45 days from
 * the baseline date of 2026-07-02.
 *
 * `createdAt` timestamps reflect plausible creation windows prior to the due date.
 * All dates are stored in ISO 8601 format (YYYY-MM-DD for dueDate; full UTC ISO
 * string for createdAt) to be consistent with the Task interface contract.
 */

import { Task } from "../types/task";

/**
 * Seed dataset used by `useTaskStore.initializeTasks()`.
 * Do NOT mutate this array at runtime — it is the single source of truth for
 * the initial application state.
 */
export const mockTasks: Task[] = [
  // ── In Progress ──────────────────────────────────────────────────────────
  {
    id: 1,
    title: "Redesign Onboarding Flow UI",
    description:
      "Audit the current 6-step onboarding wizard, identify friction points from session recordings, and deliver high-fidelity Figma prototypes for the revised 3-step flow.",
    status: "In Progress",
    priority: "High",
    assignedTo: "Sarah Johnson",
    dueDate: "2026-07-14",
    createdAt: "2026-06-20T08:30:00.000Z",
  },
  {
    id: 2,
    title: "Migrate Auth Service to OAuth 2.1",
    description:
      "Replace legacy session-cookie authentication with OAuth 2.1 PKCE flow across all API endpoints. Includes token rotation, refresh-token storage, and security audit.",
    status: "In Progress",
    priority: "High",
    assignedTo: "Mike Chen",
    dueDate: "2026-07-18",
    createdAt: "2026-06-22T10:00:00.000Z",
  },
  {
    id: 3,
    title: "Build Analytics Export Module",
    description:
      "Implement CSV and Excel export functionality for the reporting dashboard. Support column selection, date-range filtering, and async generation for large datasets.",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Emma Wilson",
    dueDate: "2026-07-22",
    createdAt: "2026-06-25T09:15:00.000Z",
  },

  // ── Pending ───────────────────────────────────────────────────────────────
  {
    id: 4,
    title: "Set Up End-to-End Testing Suite",
    description:
      "Configure Playwright for the web app and write coverage for the five critical user journeys: sign-up, task creation, task assignment, status update, and deletion.",
    status: "Pending",
    priority: "High",
    assignedTo: "Alex Kumar",
    dueDate: "2026-07-28",
    createdAt: "2026-06-28T14:00:00.000Z",
  },
  {
    id: 5,
    title: "Draft Q3 Engineering Roadmap",
    description:
      "Collaborate with product and design leads to compile the Q3 engineering roadmap. Include capacity planning, dependency mapping, and risk mitigation strategies.",
    status: "Pending",
    priority: "Medium",
    assignedTo: "Lisa Anderson",
    dueDate: "2026-07-31",
    createdAt: "2026-06-29T11:30:00.000Z",
  },
  {
    id: 6,
    title: "Implement Notification Preference Center",
    description:
      "Build a user-facing settings panel for granular control over email, push, and in-app notification channels. Persist preferences per account using the profile API.",
    status: "Pending",
    priority: "Medium",
    assignedTo: "David Brown",
    dueDate: "2026-08-05",
    createdAt: "2026-06-30T08:00:00.000Z",
  },
  {
    id: 7,
    title: "Upgrade Node.js Runtime to v22 LTS",
    description:
      "Evaluate breaking changes between Node.js 18 and 22 LTS, update all CI/CD pipeline definitions, run the full regression suite, and coordinate staged rollout to production.",
    status: "Pending",
    priority: "Low",
    assignedTo: "Sarah Johnson",
    dueDate: "2026-08-12",
    createdAt: "2026-07-01T07:45:00.000Z",
  },

  // ── Completed ─────────────────────────────────────────────────────────────
  {
    id: 8,
    title: "Refactor Database Query Layer",
    description:
      "Replace raw SQL concatenation with parameterised queries across the reporting module, add connection-pool health checks, and document the updated data-access patterns.",
    status: "Completed",
    priority: "High",
    assignedTo: "Mike Chen",
    dueDate: "2026-06-30",
    createdAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: 9,
    title: "Conduct Accessibility Audit — WCAG 2.1 AA",
    description:
      "Run automated Axe scans and manual keyboard/screen-reader tests across all primary views. Produce a remediation report ranked by impact severity and estimated effort.",
    status: "Completed",
    priority: "Medium",
    assignedTo: "Emma Wilson",
    dueDate: "2026-07-01",
    createdAt: "2026-06-15T10:30:00.000Z",
  },

  // ── Rejected ──────────────────────────────────────────────────────────────
  {
    id: 10,
    title: "Integrate Third-Party Chat Widget",
    description:
      "Proof-of-concept integration of a vendor chat SDK into the support portal. Rejected after security review flagged unacceptable data-residency and GDPR compliance gaps.",
    status: "Rejected",
    priority: "Low",
    assignedTo: "Alex Kumar",
    dueDate: "2026-07-10",
    createdAt: "2026-06-18T13:00:00.000Z",
  },
];
