import { useState, useEffect } from "react";

/**
 * @file useLocalStorage.ts
 * @description A generic, type-safe hook for reading and writing values to
 * `localStorage` with JSON serialization. Handles parse errors gracefully and
 * keeps React state in sync with the stored value.
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage<string>('app-theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Lazy initializer — reads from localStorage once on mount.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // If parsing fails (corrupted data), fall back to the initial value.
      return initialValue;
    }
  });

  /**
   * Persist a new value to both React state and localStorage.
   * Accepts either a direct value or an updater function (same API as useState).
   */
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        typeof value === "function"
          ? (value as (prev: T) => T)(storedValue)
          : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`[useLocalStorage] Failed to set key "${key}":`, error);
    }
  };

  /**
   * Remove the key from localStorage and reset state to the initial value.
   */
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`[useLocalStorage] Failed to remove key "${key}":`, error);
    }
  };

  // Keep in sync if another tab/window changes the same key.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          // ignore cross-tab parse errors
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
