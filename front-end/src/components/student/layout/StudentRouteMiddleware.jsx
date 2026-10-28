import React, { useEffect, Component } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { StudentProvider } from '../../../context/StudentContext';

/**
 * StudentErrorBoundary
 * Catches uncaught runtime exceptions in student portal routes to prevent white screens.
 */
class StudentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Student Portal caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {this.state.error?.message ||
                  'An unexpected error occurred while loading this page.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.resetError}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try again
              </button>
              <Link
                to="/student/dashboard"
                onClick={this.resetError}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Home className="w-3.5 h-3.5" /> Student Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * StudentRouteMiddleware
 * Centralized Routing Middleware for the Student / Learner Portal.
 *
 * Middleware Pipeline:
 * 1. Viewport Scroll Restoration Middleware: Automatically scrolls to the top of the viewport on path change.
 * 2. Persistent Context Injection Middleware: Injects StudentProvider once across all nested routes via <Outlet />.
 * 3. Error Boundary Middleware: Prevents blank white screen crashes on unexpected runtime exceptions.
 */
export function StudentRouteMiddleware() {
  const location = useLocation();

  // Scroll Restoration Middleware: reset viewport on each route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <StudentErrorBoundary resetKey={location.pathname}>
      <StudentProvider>
        <Outlet />
      </StudentProvider>
    </StudentErrorBoundary>
  );
}

export default StudentRouteMiddleware;
