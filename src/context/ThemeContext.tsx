import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * @file ThemeContext.tsx
 * @description Provides a global light/dark theme toggle backed by localStorage.
 *
 * Uses:
 * - `useLocalStorage` — persists the user's preference across sessions
 * - `useEffect`       — syncs the `data-theme` HTML attribute on theme change
 * - React Context     — makes the theme available anywhere in the tree without prop drilling
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
 */

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Resolves the initial theme preference in priority order:
 * 1. Stored localStorage value
 * 2. Operating-system `prefers-color-scheme` setting
 * 3. Fallback: 'light'
 */
function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useLocalStorage handles initialisation from storage + cross-tab sync.
  const [theme, setTheme] = useLocalStorage<Theme>('app-theme', getSystemTheme());

  // Sync the data-theme attribute on <html> whenever theme changes.
  // CSS selectors use [data-theme='dark'] to override custom property values.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to consume ThemeContext.
 *
 * @throws {Error} When called outside of a `<ThemeProvider>` — provides a
 * clear diagnostic message instead of a cryptic null-reference failure.
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      '[useTheme] must be used inside a <ThemeProvider>. ' +
      'Ensure your component tree is wrapped with <ThemeProvider>.'
    );
  }
  return context;
};
