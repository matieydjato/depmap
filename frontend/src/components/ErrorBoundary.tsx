import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled React errors and renders a fallback UI
 * instead of white-screening the entire app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[DepMap] Uncaught UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 text-[var(--color-text-secondary)]">
          <h1 className="text-xl font-semibold text-[var(--color-accent-red)]">
            Something went wrong
          </h1>
          <p className="text-sm max-w-md text-center">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            className="px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-[6px] text-sm hover:bg-[var(--color-border)] transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
