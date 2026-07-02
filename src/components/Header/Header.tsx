/**
 * @file Header.tsx
 * @description Top-level application header.
 *
 * Renders the app title, theme toggle, notification bell,
 * and user profile with avatar — matching the design spec.
 */
import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { useTheme } from '../../context/ThemeContext';
import { ClipboardList, Moon, Sun, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <div className={styles.logoIconWrapper}>
          <ClipboardList className={styles.logoIcon} size={20} aria-hidden="true" />
        </div>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Employee Task Management</h1>
          <div className={styles.systemStatus}>
            <span className={styles.statusIndicatorPulse} />
            <span className={styles.statusText}>System Live</span>
          </div>
        </div>
      </div>

      <div className={styles.welcomeSection}>
        <div className={styles.welcomeHeading}>Good Evening, Bijo</div>
        <div className={styles.timestampText}>Dashboard &bull; Today, July 2</div>
      </div>

      <div className={styles.actionsContainer}>
        {/* Theme toggle */}
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          id="theme-toggle-btn"
        >
          {theme === 'light'
            ? <Sun size={18} aria-hidden="true" />
            : <Moon size={18} aria-hidden="true" />
          }
        </button>

        {/* Notifications bell */}
        <button
          className={`${styles.iconButton} ${styles.notificationBtn}`}
          aria-label="Notifications"
          title="Notifications"
          id="notifications-btn"
        >
          <Bell size={18} aria-hidden="true" />
          <span className={styles.notificationDot} aria-hidden="true" />
        </button>

        {/* User profile */}
        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            className={styles.profileButton}
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="User profile menu"
            aria-expanded={profileOpen}
            id="profile-menu-btn"
          >
            <div className={styles.avatar} aria-hidden="true">BJ</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>Bijo</span>
              <span className={styles.profileRole}>Employee</span>
            </div>
            <ChevronDown
              size={14}
              className={`${styles.chevron} ${profileOpen ? styles.chevronOpen : ''}`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown} role="menu" aria-label="Profile menu">
              <button className={styles.dropdownItem} role="menuitem">
                <User size={14} aria-hidden="true" />
                Profile
              </button>
              <button className={styles.dropdownItem} role="menuitem">
                <Settings size={14} aria-hidden="true" />
                Settings
              </button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} role="menuitem">
                <LogOut size={14} aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
