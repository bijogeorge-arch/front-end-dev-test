# Developer Documentation
## Employee Task Management Dashboard

> **This file is the candidate's own technical documentation.**  
> The assignment brief lives in `README.md`. This document explains *how* the solution was built and *why* each decision was made.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [State Management](#5-state-management)
6. [Custom Hooks](#6-custom-hooks)
7. [Component Reference](#7-component-reference)
8. [TypeScript Patterns](#8-typescript-patterns)
9. [CSS Architecture](#9-css-architecture)
10. [Key Design Decisions](#10-key-design-decisions)
11. [Interview Q&A](#11-interview-qa)

---

## 1. Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type-check without emitting files
npx tsc --noEmit

# Build for production
npm run build
```

**Node.js 18+** is required. No environment variables are needed — the app is fully client-side.

---

## 2. Tech Stack

| Tool | Version | Role |
|---|---|---|
| React | 18.3 | UI library |
| TypeScript | 5.2 | Static type safety |
| Vite | 5.3 | Build tool and dev server |
| Zustand | 4.5 | Global state management |
| CSS Modules | (native) | Scoped component styling |
| Inter (Google Fonts) | — | Primary typeface |

### Why Zustand over plain Redux?

Zustand was chosen because:
- Zero boilerplate (no actions/reducers/selectors split)
- Built-in `persist` middleware makes localStorage integration a single line
- The assignment explicitly lists it as an allowed alternative to React Context
- It is a common real-world choice for this scale of application

React Context **is also used** — `ThemeContext` for the light/dark theme and `TaskContext` as a Context bridge over the Zustand store, explicitly demonstrating `useContext`.

---

## 3. Folder Structure

```
src/
├── components/
│   ├── DashboardLayout/     # Root orchestrator — wires all hooks + children
│   ├── ErrorBoundary/       # Catches unhandled JS errors; shows fallback UI
│   ├── Filter/              # Status, priority, sort dropdowns + active pill chips
│   ├── Header/              # App title + dark/light theme toggle
│   ├── SearchBar/           # Debounced search input + result count announcement
│   ├── StatsBar/            # Clickable summary cards (total, per-status, overdue)
│   ├── TaskCard/            # Single task card with badges, actions, delete confirm
│   ├── TaskEditModal/       # Full-screen modal for editing an existing task
│   ├── TaskForm/            # Controlled form for adding a new task
│   └── TaskList/            # Grid wrapper with loading + empty-state guards
│
├── context/
│   ├── TaskContext.tsx      # React Context (useContext) bridge over Zustand
│   └── ThemeContext.tsx     # Light/dark theme context + localStorage persistence
│
├── data/
│   └── mockTasks.ts         # 10 realistic seed tasks (all 4 statuses)
│
├── hooks/
│   ├── useDebounce.ts       # Generic value debouncer (useState + useEffect)
│   ├── useLocalStorage.ts   # Generic localStorage hook (useState + useEffect)
│   ├── useSearch.ts         # Debounced title/assignee search (useMemo + useRef)
│   ├── useTaskFilters.ts    # Status/priority filter + sort pipeline (useMemo)
│   └── useTaskStats.ts      # Live aggregate stats via .reduce() (useMemo)
│
├── store/
│   └── useTaskStore.ts      # Zustand store with persist middleware
│
├── styles/
│   └── variables.css        # Design tokens (CSS custom properties + dark theme)
│
├── types/
│   └── task.ts              # All TypeScript interfaces, union types, and constants
│
└── utils/
    └── dateUtils.ts         # Shared date helpers (getTodayString)
```

Every component folder contains exactly two files:
- `ComponentName.tsx` — logic and markup
- `ComponentName.module.css` — scoped styles

---

## 4. Architecture Overview

### Data Flow

```
Zustand Store (useTaskStore)
  tasks[] <-- persist middleware --> localStorage
        |
        | read via
        v
TaskContext  (React Context)
  TaskProvider wraps the tree; consumers call useTaskContext() -> useContext()
        |
        | tasks[]
        v
useSearch(tasks)
  debouncedQuery (300ms) -> searchResults[]  (title + assignee match)
        |
        | searchResults[]
        v
useTaskFilters(searchResults)
  -> filteredTasks[]  (status + priority filter)
  -> sorted by dueDate | priority | none
        |
        | filteredTasks[]
        v
TaskList -> TaskCard (x N)
  loading / empty-state conditional renders
```

### Provider Tree

```tsx
<ThemeProvider>           // CSS custom-property theming via useContext
  <TaskProvider>          // Task state via useContext (wraps Zustand)
    <ErrorBoundary>       // Catches unhandled errors, shows fallback
      <DashboardLayout>   // Orchestrates all hooks and layout
        <Header />
        <TaskForm />          // Sidebar - add task
        <SearchBar />         // Sidebar - debounced search
        <FilterControls />    // Sidebar - filter and sort
        <StatsBar />          // Main canvas - clickable status summary
        <TaskList>            // Main canvas - task grid
          <TaskCard />        // Individual task card
        </TaskList>
        <TaskEditModal />     // Portal-level - edit existing task
      </DashboardLayout>
    </ErrorBoundary>
  </TaskProvider>
</ThemeProvider>
```

---

## 5. State Management

### Zustand Store (`src/store/useTaskStore.ts`)

Manages the canonical task list and exposes five pure actions:

| Action | Signature | Description |
|---|---|---|
| `initializeTasks` | `() => void` | Seeds mock data on first load; no-op if tasks exist |
| `addTask` | `(task: Omit<Task, 'id' or 'createdAt'>) => void` | Appends a new task; auto-assigns `id` and `createdAt` |
| `deleteTask` | `(id: number) => void` | Removes a task by ID |
| `updateTaskStatus` | `(id: number, status: TaskStatus) => void` | Updates only the status field |
| `updateTask` | `(id: number, updates: Partial<...>) => void` | Merges a partial update |

The `persist` middleware serialises the `tasks` array to `localStorage` under the key `"task-dashboard-store"` automatically on every mutation.

**ID generation** uses a single-pass `.reduce()` to find the current maximum ID, then adds 1. This is O(n) and produces gap-free IDs even after deletions.

### React Context (`src/context/TaskContext.tsx` and `ThemeContext.tsx`)

Two contexts are provided:

| Context | Provider | Consumer hook | Purpose |
|---|---|---|---|
| `TaskContext` | `<TaskProvider>` | `useTaskContext()` | Exposes Zustand task state and actions via `useContext` |
| `ThemeContext` | `<ThemeProvider>` | `useTheme()` | Exposes `theme` and `toggleTheme` via `useContext` |

`TaskContext` wraps the Zustand store rather than replacing it. The store handles persistence and mutations; the Context layer makes React's native `useContext` the consumer API. The context value is **memoized with `useMemo`** so consumers only re-render when `tasks` or an action reference changes.

---

## 6. Custom Hooks

### `useDebounce<T>(value, delay)` — `src/hooks/useDebounce.ts`

A generic hook that delays propagation of a value until the user stops changing it.

```ts
const debouncedQuery = useDebounce<string>(searchQuery, 300);
```

**Hooks used:** `useState`, `useEffect`

**Pattern:** `useEffect` sets a `setTimeout`; the cleanup function calls `clearTimeout`, so the timer resets on every change and fires only 300 ms after the last change.

---

### `useLocalStorage<T>(key, initialValue)` — `src/hooks/useLocalStorage.ts`

A generic, type-safe hook for reading and writing values to `localStorage`.

```ts
const [theme, setTheme, removeTheme] = useLocalStorage<Theme>('app-theme', 'light');
```

**Hooks used:** `useState`, `useEffect`

**Features:**
- Lazy initialiser — reads from `localStorage` once on mount, falls back gracefully on parse errors
- Accepts a direct value or an updater function (same API as `useState`)
- Cross-tab sync via the browser `"storage"` event

---

### `useSearch(tasks)` — `src/hooks/useSearch.ts`

Debounced, case-insensitive search across `task.title` and `task.assignedTo`.

```ts
const { searchQuery, setSearchQuery, searchResults, inputRef } = useSearch(tasks);
```

**Hooks used:** `useState`, `useMemo`, `useCallback`, `useRef`

| Return value | Type | Description |
|---|---|---|
| `searchQuery` | `string` | Raw (non-debounced) input value |
| `setSearchQuery` | `(q: string) => void` | Stable setter (wrapped in `useCallback`) |
| `searchResults` | `Task[]` | Tasks matching the debounced query |
| `inputRef` | `RefObject<HTMLInputElement>` | Attached to the input for imperative focus |

**Pipeline:** `searchQuery` → `useDebounce(300ms)` → `debouncedQuery` → `useMemo` filter → `searchResults`

---

### `useTaskFilters(tasks)` — `src/hooks/useTaskFilters.ts`

Multi-criteria filter and sort pipeline, applied on top of `useSearch` output.

```ts
const {
  filteredTasks, statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  sortBy, setSortBy, isFiltered, resetFilters
} = useTaskFilters(searchResults);
```

**Hooks used:** `useState`, `useMemo`, `useCallback`

| `sortBy` value | Algorithm |
|---|---|
| `"dueDate"` | Ascending by `new Date(dueDate).getTime()` |
| `"priority"` | Descending by weight: High=3, Medium=2, Low=1 |
| `"none"` | Original insertion order preserved |

`isFiltered` is `true` whenever any setting differs from its default, enabling the visible "Reset" button.

---

### `useTaskStats(tasks)` — `src/hooks/useTaskStats.ts`

Derives live aggregate statistics from the full (unfiltered) task array.

```ts
const { total, counts, overdueCount } = useTaskStats(tasks);
```

**Hooks used:** `useMemo`

| Return value | Type | Description |
|---|---|---|
| `total` | `number` | Total task count |
| `counts` | `Record<TaskStatus, number>` | Per-status counts, seeded with 0 for every status |
| `overdueCount` | `number` | Tasks past due date, not Completed or Rejected |

Uses a single-pass `.reduce()` to build the status counts map, then a separate `.filter()` for overdue detection. Both run inside one `useMemo` call.

---

## 7. Component Reference

### `DashboardLayout` — Root Orchestrator

The only "smart" component in the tree. Wires all custom hooks together and manages UI state. All sibling and child components receive only derived values and stable callbacks as props.

**Hooks used inside this component:**

| Hook | Usage |
|---|---|
| `useTaskContext()` | `useContext` — task state and actions |
| `useSearch(tasks)` | Debounced search pipeline |
| `useTaskFilters(searchResults)` | Filter and sort pipeline |
| `useState` x7 | loading, mobileFormOpen, mobileFiltersOpen, editingTask, createTaskOpen, searchOpen, filtersOpen |
| `useEffect` x5 | Initialize tasks, loading timer, ESC listener, scroll-to-top, search auto-focus |
| `useCallback` x5 | Stable handler references for memoised children |
| `useRef` x1 | Scroll container — programmatic scroll-to-top on filter change |

- **Mobile Drawer Orchestration:** Slides the sidebar into a full-height off-canvas drawer (width `320px`, max-width `88vw`) below `768px`. Wires up close buttons, backdrops, and an ESC keypress handler to dismiss panels.


---

### `TaskCard` — Task Display Unit

Renders a single task. Demonstrates **four switch-case rendering functions:**

| Function | Switch on |
|---|---|
| `renderStatusBadge(status)` | Pending / In Progress / Completed / Rejected |
| `renderPriorityBadge(priority)` | High / Medium / Low |
| `getNextStatus(current)` | Next status in the progression cycle |
| `getProgressLabel(status)` | Button label for the cycle action |

**Two-step delete:** clicking the trash icon sets local `pendingDelete = true` (via `useState`), revealing inline Yes/No buttons — no `window.confirm()`.

**Overdue detection:** compares `task.dueDate` to today's ISO string using safe lexicographic comparison (valid for `YYYY-MM-DD` format).

Wrapped in `React.memo` — re-renders only when its own `task` prop changes.

---

### `TaskForm` — Add Task

Fully controlled form (all inputs driven by `useState`).

| Field | Validation rule |
|---|---|
| Title | Required, minimum 3 characters |
| Assigned Employee | Required |
| Due Date | Required, cannot be in the past |

- Real-time per-field validation fires on every `onChange`
- Full validation sweep runs on submit
- Success flash message is shown after a successful submission
- **Mobile Stacking Layout:** The layout row always stacks input fields vertically inside the narrow sidebar (≤320px wide) to prevent cramped, unreadable fields.


---

### `TaskEditModal` — Edit Task

Full-screen modal pre-filled from the selected task. Adds to `TaskForm`'s behaviour:
- Auto-focuses the title input on mount (`useRef`)
- Focus trap — `Tab` / `Shift+Tab` cycles only within the modal (`useRef` + `useEffect`)
- ESC key closes the modal (`useEffect` + `addEventListener`)
- Body scroll locked while open (`document.body.style.overflow = 'hidden'`)
- 200 ms simulated save delay to demonstrate a loading state
- **Touch Target & Mobile Adjustments:** Implements standard touch target heights (min `44px`) on inputs and action buttons. Stacks side-by-side rows below `480px`, and stretches buttons to full-width block elements below `360px` for optimal usability on mobile.


---

### `FilterControls` — Filter and Sort

Three `<select>` dropdowns for status, priority, and sort key. When any filter is active:
- **Pill chips** appear at the top, each individually dismissible
- A **Reset** button clears all at once

Wrapped in `React.memo`.

---

### `SearchBar` — Debounced Search

- The `inputRef` from `useSearch` is attached to the `<input>` for external `.focus()` control
- A clear (x) button appears when a query is present
- `aria-live="polite"` region announces result count to screen readers after the debounce fires

---

### `StatsBar` — Summary Cards

Five clickable stat cards (Total, Pending, In Progress, Completed, Rejected):
- Counts derived from `useTaskStats`
- Clicking applies or toggles that status as a filter
- `aria-pressed` marks the active card for screen readers
- An **Overdue** card appears conditionally when `overdueCount > 0`
- **Mobile Overflow Handling:** Uses horizontal scrolling with `flex-shrink: 0` cards so they remain fully legible and do not collapse on narrow devices (such as iPhone SE).

---

### `TaskList` — Task Grid Wrapper

Renders loading skeleton states, empty filter/search results, or maps task cards.
- **Responsive Grid:** Sets column sizes dynamically with `min(100%, 320px)` to prevent cards from overflowing containment.
- **Mobile Layout:** Forces a strict single-column layout with tighter vertical gaps below `768px`.


### `ErrorBoundary` — Error Fallback

A class component (required — `getDerivedStateFromError` is not available as a hook). Catches any unhandled JavaScript error in the subtree and renders a user-friendly fallback with a "Try Again" button that resets `hasError` to `false` without a full page reload.

---

### `Header` — App Bar

Reads `useTheme()` (which calls `useContext(ThemeContext)`) for the current theme value and toggle function. No theme-related props are threaded through the component tree — Context eliminates prop drilling.
- **Height Scaling:** Standardized to `80px` height to accommodate centered titles and touch-friendly theme toggling across responsive layouts.


---

## 8. TypeScript Patterns

All types live in `src/types/task.ts` — the single source of truth.

### Union Types (closed sets)

```ts
export type TaskStatus   = "Pending" | "In Progress" | "Completed" | "Rejected";
export type TaskPriority = "Low" | "Medium" | "High";
export type SortByKey    = "dueDate" | "priority" | "none";
```

Adding a new status only requires a change in `task.ts` — TypeScript will surface every exhaustive switch that needs updating.

### Utility Types

```ts
// Form input — id and createdAt are auto-generated, not user-supplied
type TaskFormInput = Omit<Task, "id" | "createdAt">;

// Partial update for the edit flow — preserves fields not in the update
updateTask: (id: number, updates: Partial<Omit<Task, "id" | "createdAt">>) => void
```

### Runtime Constants (DRY option rendering)

```ts
export const TASK_STATUSES: ReadonlyArray<TaskStatus> = [
  "Pending", "In Progress", "Completed", "Rejected"
] as const;
```

Used to render `<select>` options from a single source — no magic strings in components.

### Generic Hooks

```ts
useLocalStorage<Theme>('app-theme', 'light')  // T = Theme
useDebounce<string>(searchQuery, 300)         // T = string
```

### Strict Record Seeding

```ts
// Seed the accumulator so all keys are always present (no missing-key bugs)
Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<TaskStatus, number>
```

---

## 9. CSS Architecture

### Design Token System (`src/styles/variables.css`)

All visual constants are CSS custom properties on `:root`. No hardcoded hex values appear anywhere else.

| Token category | Examples |
|---|---|
| Brand colours | `--color-primary`, `--color-primary-hover` |
| Surfaces | `--color-background-app`, `--color-background-surface` |
| Semantic status | `--color-status-todo-bg`, `--color-status-completed-text` |
| Semantic priority | `--color-priority-high-bg`, `--color-priority-low-text` |
| Spacing (8px grid) | `--spacing-xs` (4px) through `--spacing-xxl` (48px) |
| Typography | `--font-family`, `--font-size-*`, `--font-weight-*` |
| Shape | `--border-radius-sm` through `--border-radius-full` |
| Elevation | `--shadow-sm` through `--shadow-xl` |
| Motion | `--transition-fast`, `--transition-normal`, `--transition-slow` |

### Dark Theme

`[data-theme='dark'] { … }` overrides every `:root` token. `ThemeContext` sets `document.documentElement.setAttribute('data-theme', theme)` on change — no JavaScript colour swaps, just CSS cascade.

### Responsive Layout

| Breakpoint | Layout |
|---|---|
| 1280px and above | 320px sidebar (`--sidebar-width`), flexible main canvas |
| 1024px to 1280px | 260px tablet sidebar (`--sidebar-width-tablet`), flexible main canvas |
| 768px to 1024px | 240px compact sidebar, flexible main canvas |
| Below 768px | Single column; sidebar becomes an off-canvas slide-in drawer (width 320px, max 88vw) |

Mobile sidebar slides in with `transform: translateX(-100%)` to `translateX(0)`. A blurred backdrop (`backdrop-filter: blur(4px)`) fades in and closes the panel on click. ESC key also closes active panels, and dedicated close buttons are displayed in the drawer header.


---

## 10. Key Design Decisions

### `useSearch` feeds into `useTaskFilters`, not the reverse

This ordering means:
1. Search produces a smaller array; filter/sort operates on fewer items
2. `filteredCount` and `totalCount` always reflect the compound result correctly
3. The two hooks remain independently reusable

### Two-step delete over `window.confirm()`

`window.confirm()` is blocking, unstyable, and visually inconsistent across browsers. The inline Yes/No pattern keeps the confirmation in context, is fully styleable, and follows React's unidirectional data flow.

### `TaskForm` directly imported in `DashboardLayout`

Passing `TaskForm` as a `children` prop was opaque — a reader of `DashboardLayout.tsx` would not know what renders in the sidebar without also opening `App.tsx`. Direct import is self-documenting.

### `React.memo` on every leaf component

Prevents re-renders from propagating to every `TaskCard` on each debounced search tick. Without this, a list of 50 cards would re-render 50 times per search keystroke (after the 300ms debounce).

### `useCallback` on all action handlers

`React.memo` only short-circuits renders when all props are reference-stable. `useCallback` keeps function references stable across parent re-renders, making the memo effective.

---

## 11. Interview Q&A

**Q: Why did you choose this component structure?**

`DashboardLayout` is the only "smart" component — it owns all hooks, derives all state, and passes stable callbacks down. Every other component is stateless or manages only local UI state. This makes each component independently testable and the data flow easy to trace.

---

**Q: Why did you create the custom hooks?**

`useSearch` and `useTaskFilters` encapsulate complex stateful logic that would otherwise bloat `DashboardLayout`. By naming them as pipelines, `DashboardLayout` reads as a composition of named data transformations. The hooks are independently reusable and independently testable.

---

**Q: When would you use `useMemo` vs `useCallback`?**

`useMemo` memoises a **computed value** — avoid expensive recalculations (filter, sort, reduce) when inputs have not changed. `useCallback` memoises a **function reference** — keep references stable so that `React.memo`-wrapped children are not invalidated unnecessarily. The function body cost is irrelevant; the goal is referential equality.

---

**Q: Why did you use conditional rendering in a particular place?**

`TaskList` uses early returns for loading and empty states, keeping the happy-path (the grid) un-nested. `TaskCard` uses `&&` guards for the overdue banner and delete confirm because they are additive to an always-rendered component, not alternative layouts.

---

**Q: Explain the React component lifecycle and the purpose of `useEffect`.**

In function components: render → commit to DOM → effects run. `useEffect` covers `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` (via its cleanup function). In this project it is used to start/clear timers, add/remove event listeners, sync `localStorage`, sync `data-theme`, and auto-focus inputs — all side effects that must run after the DOM is ready.

---

**Q: How does React reconciliation work?**

React diffs the previous virtual DOM against the new tree produced by a render. Same-type elements are updated in place; different-type elements are unmounted and remounted. The `key` prop on list items tells React which elements can be reused versus recreated — this is why `task.id` is used as `key` in `TaskList`.

---

**Q: What is the difference between controlled and uncontrolled components?**

A **controlled** component has its value driven by React state (`<input value={formData.title} onChange={handleChange} />`). React is the single source of truth. An **uncontrolled** component stores its value in the DOM, accessed via `ref`. Both forms in this project are fully controlled, making validation and programmatic reset trivial.

---

**Q: How would you optimise this for thousands of tasks?**

1. Virtual rendering with `react-window` or `@tanstack/virtual` — only visible cards in the DOM
2. Move search/filter/sort to server-side API queries
3. Pagination or infinite scroll — load tasks in pages
4. Increase debounce delay to 500ms for heavy filter pipelines
5. Web Worker for the sort/filter pipeline if it becomes CPU-bound

---

**Q: How would you manage global state in a larger application?**

Keep Zustand for client-side UI state (filters, theme, modals). Add **TanStack Query** (React Query) for server data — it handles caching, background re-fetching, and loading/error states automatically. Context API stays for low-frequency, app-wide values like theme.

---

**Q: Why did you choose specific TypeScript interfaces/types, and how do they improve maintainability?**

Union types create a closed set — adding a new status requires one change in `task.ts`; TypeScript highlights every exhaustive switch that needs updating. `Omit<>` in `addTask` makes it impossible to supply auto-generated fields. Generic hooks (`useLocalStorage<T>`, `useDebounce<T>`) are reusable without sacrificing type safety. `ReadonlyArray<>` on constants prevents accidental mutation.

---

*Documentation by the candidate — 2026-07-03*
