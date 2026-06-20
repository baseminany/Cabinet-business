import { Component, type ReactNode } from 'react';

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-warmWhite p-6 text-ink">
        <div className="premium-card max-w-lg p-6 text-center">
          <p className="eyebrow text-brass">Studio recovered</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Something in the designer crashed.</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">Your project is autosaved locally. Refresh the page or start a new design if the issue repeats.</p>
          {this.state.message && <pre className="mt-4 max-h-28 overflow-auto rounded-xl bg-porcelain p-3 text-left text-xs text-ink-muted">{this.state.message}</pre>}
          <button onClick={() => window.location.reload()} className="premium-button mt-5 px-6 py-3 text-sm">Reload Studio</button>
        </div>
      </div>
    );
  }
}
