import { Component, type PropsWithChildren, type ReactNode } from "react";

interface EngineErrorBoundaryProps extends PropsWithChildren {
  /** Called once if the engine throws — the app should treat this as "loading is over". */
  onError: () => void;
}

interface EngineErrorBoundaryState {
  hasError: boolean;
}

/**
 * If any part of the cinematic engine throws during render (e.g. a theme's
 * asset fails to parse in an unexpected way), this fails OPEN: it hides
 * the loader and calls onError so the app reveals its content, rather than
 * leaving the user staring at a permanently blank/black screen with no
 * visible error and no way forward.
 */
export class EngineErrorBoundary extends Component<
  EngineErrorBoundaryProps,
  EngineErrorBoundaryState
> {
  state: EngineErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): EngineErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error("[CinematicLoadingEngine] render error, revealing page:", error);
    this.props.onError();
  }

  render(): ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
