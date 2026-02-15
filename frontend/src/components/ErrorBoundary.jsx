import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'var(--cream-100)', color: 'var(--cream-900)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'var(--cream-200)' }}
            aria-hidden
          >
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold font-dm-sans mb-2">Something went wrong</h1>
          <p className="text-base mb-6 max-w-md" style={{ color: 'var(--cream-700)' }}>
            We ran into an unexpected error. You can go back home or try again.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/stream-selector"
              className="btn-primary-warm px-6 py-3"
            >
              Go to Home
            </Link>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-secondary-warm px-6 py-3"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
