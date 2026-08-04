/**
 * sequence.defaults.ts
 *
 * Engine-level defaults. These exist so a minimal theme (e.g. a future
 * Company Logo theme) can lean entirely on sensible timings without
 * defining its own, while a theme like Phoenix can override any of them
 * in its own config. The camera system also reads these durations
 * directly so its motion always stays in lockstep with each beat's
 * length, without duplicating numbers.
 *
 * Every duration is in seconds unless suffixed `Ms`.
 */

export const sequenceDurations = {
  void: 0.5,
  heat: 0.9,
  ember: 0.5,
  ignition: 1.3,
  awaken: 0.4,
  stabilize: 0.5,
  rise: 1.6,
  settle: 0.3,
  // idle has no fixed duration — it loops one cycle at a time until
  // isLoading resolves. This is the *default single-cycle* duration a
  // theme can reference if it wants engine-consistent idle timing.
  idleCycle: 2.85,
  gather: 0.6,
  launch: 1.1,
} as const;

export const sequenceEasing: {
  cinematicEaseOut: number[];
  weightedEaseInOut: number[];
  acceleratingEaseIn: number[];
} = {
  /** Gentle ease-out, no overshoot — used for entrances (rise, stabilize). */
  cinematicEaseOut: [0.22, 1, 0.36, 1],
  /** Smooth ease-in-out — used for weighted, natural motion (idle wing beats). */
  weightedEaseInOut: [0.45, 0, 0.55, 1],
  /** Sharp ease-in — used for accelerating exits (launch). */
  acceleratingEaseIn: [0.55, 0, 1, 0.45],
};

export const sequenceSafety = {
  /** Absolute ceiling before the engine force-exits regardless of isLoading. */
  maxLoadingTimeMs: 15000,
  /**
   * Minimum number of full idle cycles guaranteed to play before the exit
   * sequence is allowed to begin, even if isLoading resolves almost
   * instantly. Without this, a very fast API response could mean the idle
   * loop runs for well under one cycle, making the flap effectively
   * invisible to the person watching.
   */
  minimumIdleCycles: 2,
} as const;

export const exitTransition = {
  /** Final whole-scene fade (backdrop + glow + body + trail together) that
   *  runs after the theme's launch motion finishes, so nothing can visibly
   *  disappear before or after anything else — it's one fade, not several
   *  independently-timed ones that happen to line up. */
  sceneFadeDurationSec: 0.5,
} as const;

/** Simplified timing used only by the engine's built-in reduced-motion fallback. */
export const reducedMotionDefaults = {
  fadeInDuration: 0.6,
  holdDuration: 0.2,
} as const;
