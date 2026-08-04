import type { ComponentType } from "react";
import type { AnimationControls } from "framer-motion";

/**
 * The full emotional beat order, shared by every theme. This is the
 * contract the engine enforces — no theme may reorder, skip, or rename
 * beats. A theme may make any individual beat's execution near-instant
 * (see the Company Logo theme discussed in the architecture), but the
 * sequence itself never changes.
 */
export type CinematicBeat =
  | "void"
  | "heat"
  | "ember"
  | "ignition"
  | "awaken"
  | "stabilize"
  | "rise"
  | "idle"
  | "gather"
  | "launch"
  | "done";

/**
 * The imperative functions a theme supplies, one per beat. The engine
 * awaits each in order (running the matching camera beat in parallel) and
 * never inspects what happens inside — this is the seam that lets Dragon,
 * Falcon, Company Logo, and Seasonal themes plug into the same engine
 * without changing engine code.
 *
 * `playIdleCycle` plays exactly one cycle; the engine itself owns the
 * looping and the decision of when to stop (based on `isLoading`).
 */
export interface CinematicBeatPlayers {
  playVoid: () => Promise<void> | void;
  playHeat: () => Promise<void>;
  playEmber: () => Promise<void>;
  playIgnition: () => Promise<void>;
  playAwaken: () => Promise<void>;
  playStabilize: () => Promise<void>;
  playRise: () => Promise<void>;
  playIdleCycle: () => Promise<void>;
  playGather: () => Promise<void>;
  playLaunch: () => Promise<void>;
  /**
   * Optional theme-specific reduced-motion sequence. If a theme doesn't
   * provide one, the engine falls back to its own generic simple-fade
   * branch, so no theme is required to implement this.
   */
  playReducedMotionReveal?: () => Promise<void>;
  /** Stops all in-flight/looping animations. Called on unmount and before exit. */
  stopAll: () => void;
}

/**
 * A theme's `useSequence` hook returns its controls (whatever shape makes
 * sense for that creature — a phoenix needs left/right wing controls, a
 * simple logo might need only one) plus the beat players that drive them.
 *
 * Generic over `TControls` so each theme's slot components receive a
 * strongly-typed, theme-specific controls object rather than `unknown`.
 */
export interface CinematicThemeSequence<TControls> {
  controls: TControls;
  players: CinematicBeatPlayers;
}

/**
 * The full contract a theme must implement to plug into the engine.
 * Slot components are pure/presentational — they receive their theme's
 * controls object as a prop and render motion elements against it; they
 * never read configuration or sequence state directly.
 */
export interface CinematicTheme<TControls = unknown> {
  /** Unique, stable identifier (used for aria labeling and debugging). */
  id: string;
  /** Human-readable name announced to assistive tech, e.g. "Phoenix Media". */
  label: string;
  /** The sequencing hook — owns this theme's AnimationControls + beat players. */
  useSequence: () => CinematicThemeSequence<TControls>;
  /** Ambient/pulsing/trailing light layer. */
  Glow: ComponentType<{ controls: TControls }>;
  /** Scene-3-equivalent ignition/reveal layer (unmounted after `awaken`). */
  Ignition: ComponentType<{ controls: TControls }>;
  /** The creature/mark itself once ignition has finished. */
  Body: ComponentType<{ controls: TControls }>;
  /** Exit energy trail, active only during `launch`. */
  Trail: ComponentType<{ controls: TControls }>;
}

/** Public props for the engine component itself. */
export interface CinematicLoadingEngineProps<TControls = unknown> {
  theme: CinematicTheme<TControls>;
  /** External loading gate. The idle beat loops until this becomes false. */
  isLoading: boolean;
  /** Called once the phoenix (or any creature) has fully exited the screen. */
  onExitComplete?: () => void;
  /** Safety ceiling in ms; forces exit if isLoading never resolves. Default: see sequence.defaults.ts */
  maxLoadingTimeMs?: number;
}

/** Shared shape for the engine-owned camera's beat players (see camera/). */
export interface CameraBeatPlayers {
  playHeat: () => Promise<void>;
  playEmber: () => Promise<void>;
  playIgnition: () => Promise<void>;
  playAwaken: () => Promise<void>;
  playStabilize: () => Promise<void>;
  playRise: () => Promise<void>;
  startIdleBreathing: () => void;
  stopIdleBreathing: () => void;
  playGather: () => Promise<void>;
  playLaunch: () => Promise<void>;
  reset: () => void;
}

export type { AnimationControls };
