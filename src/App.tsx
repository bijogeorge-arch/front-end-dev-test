import React from 'react';
import './styles/variables.css';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Header } from './components/Header/Header';
import { DashboardLayout } from './components/DashboardLayout/DashboardLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TaskProvider>
        <ErrorBoundary>
          <DashboardLayout header={<Header />} />
        </ErrorBoundary>
      </TaskProvider>
    </ThemeProvider>
  );
};

export default App;
