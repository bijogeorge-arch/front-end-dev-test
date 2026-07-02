import React from 'react';
import styles from './Header.module.css';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <span className={styles.logoIcon}>📋</span>
        <h1 className={styles.title}>Employee Task Dashboard</h1>
      </div>
      <div className={styles.actionsContainer}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          id="theme-toggle-btn"
        >
          <span className={styles.themeIcon}>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span className={styles.themeLabel}>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </header>
  );
};
