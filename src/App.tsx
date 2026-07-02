import React from 'react';
import './styles/variables.css';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Header } from './components/Header/Header';
import { DashboardLayout } from './components/DashboardLayout/DashboardLayout';
import { TaskForm } from './components/TaskForm/TaskForm';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <DashboardLayout header={<Header />}>
          <TaskForm />
        </DashboardLayout>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
