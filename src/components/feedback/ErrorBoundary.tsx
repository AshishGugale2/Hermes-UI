import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render failed", error, info);
  }

  render() {
    if (this.state.failed)
      return (
        <main className="content-grid" role="alert">
          <h1>Unable to display this page</h1>
          <button
            className="icon-button"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </main>
      );
    return this.props.children;
  }
}
