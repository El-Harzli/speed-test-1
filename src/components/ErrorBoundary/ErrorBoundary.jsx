import { Component } from "react";

// Generic error boundary — catches render/lifecycle errors thrown by any
// descendant and shows `fallback` instead of leaving the tree half-mounted.
// React unmounts everything below the nearest boundary once something
// throws during render, so without one of these anywhere in the tree, a
// single unexpected error white-screens whatever isn't wrapped. This has
// to be a class component — getDerivedStateFromError / componentDidCatch
// have no hook equivalent yet.
//
// `resetKeys`: pass values that change on navigation (e.g. the current
// pathname). When any of them changes while showing the fallback, the
// boundary clears its error state and re-renders children fresh — so
// moving to a different page recovers automatically instead of staying
// stuck on the fallback until a full reload.
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // No error-reporting service wired up yet — swap this for one (Sentry,
    // etc.) when there is. For now this at least keeps the stack visible
    // instead of it vanishing along with the unmounted tree.
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (!this.state.error || !this.props.resetKeys) return;
    const changed = this.props.resetKeys.some(
      (key, i) => key !== prevProps.resetKeys?.[i],
    );
    if (changed) this.reset();
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return typeof this.props.fallback === "function"
      ? this.props.fallback(error, this.reset)
      : this.props.fallback;
  }
}

export default ErrorBoundary;
