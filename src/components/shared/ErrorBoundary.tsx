import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f12] text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-[#27272a] bg-[#18181c] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="size-7" />
            </div>
            <h2 className="text-xl font-bold font-heading text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-zinc-400">
              The page encountered an unexpected issue. Your progress and database credentials remain safely saved.
            </p>
            {this.state.error && (
              <p className="mt-3 text-xs font-mono text-red-400/90 bg-red-950/30 p-2.5 rounded-xl border border-red-900/30 line-clamp-3">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-transform hover:bg-violet-500 active:scale-95"
              >
                <RefreshCw className="size-4" /> Reload Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Home className="size-4" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

