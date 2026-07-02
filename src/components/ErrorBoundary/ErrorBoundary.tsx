/**
 * @file ErrorBoundary.tsx
 * @description Class-based React Error Boundary.
 *
 * Catches any unhandled JavaScript error anywhere in the component tree
 * and renders a fallback UI instead of crashing the whole app. Exposes a
 * "Try Again" button that resets the error state so the user can retry
 * without a full page reload.
 *
 * Must be a class component — React's `getDerivedStateFromError` and
 * `componentDidCatch` lifecycle methods are not available as hooks.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <RestOfApp />
 * </ErrorBoundary>
 * ```
 */
import React, { Component, ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you would send to an error reporting service
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer} role="alert" id="error-boundary-fallback">
          <div className={styles.errorIcon}><AlertTriangle size={48} aria-hidden="true" /></div>
          <h2 className={styles.errorTitle}>Something went wrong</h2>
          <p className={styles.errorMessage}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button className={styles.retryButton} onClick={this.handleReset}>
            <RotateCcw size={16} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
