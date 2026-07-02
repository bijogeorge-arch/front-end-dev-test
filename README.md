# Employee Task Management Dashboard

A feature-complete React 18 + TypeScript task management dashboard built as a frontend assessment project.

## 🚀 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Zustand** + `persist` | Global state with localStorage persistence |
| **CSS Modules** | Scoped component styling |

## ✨ Features

- **Task Cards** — Display title, description, employee, priority badge, status badge, and due date
- **Search** — Debounced real-time search by title or employee name (case-insensitive)
- **Filter** — Filter by status and priority with a one-click reset
- **Sort** — Sort by due date (earliest first) or priority (High → Low)
- **Add Task** — Form with real-time validation and browser-level date guards
- **Delete Task** — Inline two-step confirmation (no disruptive `window.confirm`)
- **Update Status** — Advance or reject task status with one click
- **Dark Mode** — Full dark theme toggle persisted across sessions
- **Loading State** — Spinner animation on initial mount
- **Empty State** — Friendly empty state when no tasks match filters
- **Error Boundary** — Catches and displays render errors gracefully

## 📁 Project Structure

```
src/
├── context/
│   └── ThemeContext.tsx        # useContext + ThemeProvider + useTheme hook
├── components/
│   ├── ErrorBoundary/          # Class-based error boundary
│   ├── Header/                 # App header with dark mode toggle
│   ├── DashboardLayout/        # Page layout orchestrator
│   ├── SearchBar/              # Debounced search input
│   ├── Filter/                 # Status / priority / sort controls
│   ├── TaskList/               # Grid container with loading + empty states
│   ├── TaskCard/               # Individual task card with status actions
│   └── TaskForm/               # Add task form with validation
├── hooks/
│   ├── useDebounce.ts          # Generic debounce hook
│   └── useTaskFilters.ts       # Filter + sort + search pipeline (useMemo + useCallback)
├── store/
│   └── useTaskStore.ts         # Zustand store with localStorage persistence
├── data/
│   └── mockTasks.ts            # 5 seed tasks for initial load
├── types/
│   └── task.ts                 # Task, TaskStatus, TaskPriority types
└── styles/
    └── variables.css           # Design tokens (light + dark themes, spacing, typography)
```

## 🛠️ Setup & Run

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd react-interview-project

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Opens at **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview
```

## 🧪 React Concepts Demonstrated

| Concept | Where |
|---------|-------|
| `useState` | `TaskForm`, `TaskCard`, `DashboardLayout`, `useTaskFilters` |
| `useEffect` | `DashboardLayout` (loading timer), `useDebounce`, `ThemeContext` |
| `useContext` | `ThemeContext` — `ThemeProvider` + `useTheme()` consumed in `Header` |
| `useMemo` | `useTaskFilters` — filtered + sorted task list |
| `useCallback` | `useTaskFilters` setters, `DashboardLayout` action handlers |
| Custom Hooks | `useDebounce<T>`, `useTaskFilters` |
| Switch-case rendering | Status badge, priority badge, status advancement, button labels |
| Conditional rendering | Loading spinner, empty state, error boundary, form errors, clear button, reject button |
| CSS Modules | 100% coverage — every component has a paired `.module.css` |
| TypeScript | Full type coverage — interfaces, union types, generics |
| Error Boundary | `ErrorBoundary` class component |
