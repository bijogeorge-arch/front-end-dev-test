import React, { Component, ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

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
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Something went wrong</h2>
          <p className={styles.errorMessage}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button className={styles.retryButton} onClick={this.handleReset}>
            ↺ Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
