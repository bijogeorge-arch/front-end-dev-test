# Frontend React Developer Assessment (4–5\* Hours)

## Objective

Build a small React application that demonstrates:

- React fundamentals
- Logic building
- State management
- React Hooks
- Custom Hooks
- Conditional rendering
- Switch-case rendering
- Component architecture
- CSS Modules
- Responsive UI
- Clean code practices

**Technology**

- React (Vite or CRA)
- CSS Modules
- JavaScript (Freshers)
- TypeScript (Mandatory for Experienced Developers)

---

## Submission Instructions

1. **Fork the Repository**: Fork this repository to your personal GitHub profile.
2. **Implement Your Solution**: Complete the assessment tasks in your forked repository.
3. **Submit Your Work**: Push your final code to your fork and share the repository link with us.

Once submitted, we will check out your work and perform an assessment based on the following:
- **Coding Style & Best Practices**: How clean, readable, and maintainable the code is, adhering to standard React & TypeScript guidelines.
- **Code Splitting & Architecture**: Component organization, routing/folder structure, and proper modular design.
- **Documentation**: Clear setup instructions and documentation of your architecture, custom hooks, or special design/technical choices.
- **Thinking Out of the Box**: Creative features, robust handling of edge cases, UX micro-animations, or unique problem-solving approaches.
- **Other Factors**: General application performance, responsive styling, and attention to detail.

---

# Project

## Employee Task Management Dashboard

Create a dashboard that displays employee tasks.

Each task contains:

```ts
{
  id: number;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Rejected";
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  dueDate: string;
}
```

Provide dummy JSON data.

---

# Features

## 1. Display Task List

Show all tasks inside cards.

Each card should display:

- Title
- Description
- Assigned Employee
- Priority
- Status
- Due Date

---

## 2. Search

Search by

- Title
- Employee Name

---

## 3. Filter

Filter by

- Status
- Priority

---

## 4. Sorting

Sort by

- Due Date
- Priority

---

## 5. Add Task

Create a task using a form.

Validation required.

---

## 6. Delete Task

Delete a task.

---

## 7. Update Status

Provide buttons to update status.

Example:

Pending

↓

In Progress

↓

Completed

Rejected

---

# React Knowledge Assessment

## React Hooks & State Management

Candidate should appropriately use:

- **State Management**: Implement a clean state management solution. Candidates are expected to create and use **React Context** (via `useContext`), or they may opt to use a global state management library like **Redux / Redux Toolkit** or **Zustand**.
- **React Hooks**:
  - `useState`
  - `useEffect`
  - `useContext` (if using React Context)
  - `useMemo` (where applicable)
  - `useCallback` (bonus)
  - `useRef` (bonus)

---

## Custom Hook

Create at least one reusable custom hook.

Examples:

```javascript
useSearch();
```

or

```javascript
useFilter();
```

or

```javascript
useLocalStorage();
```

---

## Conditional Rendering

Examples:

```jsx
if (!tasks.length)
```

Show

```
No Tasks Available
```

---

Loading state

```jsx
Loading...
```

---

Error state

```jsx
Something went wrong
```

---

# Switch Case Rendering

Candidate should implement rendering using switch-case instead of multiple if statements.

Example

```jsx
const renderStatus = (status) => {
  switch (status) {
    case "Pending":
      return <PendingBadge />;
    case "Completed":
      return <CompletedBadge />;
    case "Rejected":
      return <RejectedBadge />;
    default:
      return null;
  }
};
```

Use inside JSX.

---

# CSS Assessment

Must use CSS Modules.

Example

```
TaskCard.module.css
Dashboard.module.css
Button.module.css
```

Evaluate

- Flexbox/Grid
- Responsive Layout
- Hover Effects
- Active Button
- Text Overflow
- Card Alignment

---

# Component Structure

Expected folder structure

```
src/
components/
    TaskCard
    TaskList
    TaskForm
    SearchBar
    Filter
    Header
hooks/
    useSearch
    useFilter
styles/
data/
App.jsx
```

---

# Logic Assessment

Observe whether candidate:

- Writes reusable components
- Avoids duplicate code
- Uses props correctly
- Uses state correctly
- Separates business logic from UI
- Handles edge cases

---

# TypeScript Requirement

### Freshers

TypeScript is optional.

JavaScript is acceptable if React concepts are correctly implemented.

### Experienced Developers (2+ Years)

TypeScript is mandatory.

Expect:

- Interfaces
- Types
- Proper prop typing
- Generic types where appropriate
- Strict typing (avoid `any` unless justified)

---

# Bonus Tasks

If time permits:

- Pagination
- Dark/Light Theme
- Persist tasks using localStorage
- Drag-and-drop task ordering
- Debounced search
- Unit tests (React Testing Library)

---

# Evaluation Criteria (100 Marks)

| Criteria                        | Marks |
| ------------------------------- | ----: |
| React Fundamentals              |    20 |
| Logic & Problem Solving         |    20 |
| Hooks Usage                     |    15 |
| Custom Hooks                    |    10 |
| Conditional Rendering           |    10 |
| Switch-case Rendering           |     5 |
| CSS Modules & Responsive Design |    10 |
| Code Structure & Reusability    |     5 |
| TypeScript (Experienced Only)   |     5 |

---

# Interview Discussion (15–20 Minutes After Submission)

After the coding exercise, ask the candidate to explain:

1. Why did you choose this component structure?
2. Why did you create the custom hook?
3. When would you use `useMemo` vs. `useCallback`?
4. Why did you use conditional rendering in a particular place?
5. Explain the React component lifecycle and the purpose of `useEffect`.
6. How does React reconciliation work?
7. What is the difference between controlled and uncontrolled components?
8. How would you optimize this application if it scaled to thousands of tasks?
9. How would you manage global state in a larger application?
10. (Experienced) Why did you choose specific TypeScript interfaces/types, and how do they improve maintainability?

This assessment provides a balanced evaluation of React fundamentals, logical thinking, component design, hooks, styling, and (for experienced candidates) TypeScript proficiency in a single realistic project that can be completed within 4–5 hours.