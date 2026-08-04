import { sequenceDurations, sequenceEasing } from "../../engine/sequence.defaults";

/**
 * phoenix.config.ts
 *
 * Every phoenix-specific number lives here. Beat *durations* are inherited
 * from the engine's sequenceDurations (so this theme always stays in sync
 * with the camera and the engine's timeout/looping logic) — this file only
 * defines how the phoenix fills each beat's time budget, plus values with
 * no engine equivalent (colors, angles, pivot points, band count).
 */
export const phoenixConfig = {
  size: {
    width: 240,
    height: 240,
  },

  /** The SVG's own viewBox dimensions, needed for ignition band math and background-artifact filtering. */
  svgViewBoxWidth: 1024,
  svgViewBoxHeight: 1024,

  glow: {
    color: "rgba(255, 138, 46, 0.55)",
    emberColor: "rgba(255, 176, 82, 0.9)",
    heatOpacity: 0.25,
    heatScale: 1.6, // wide, diffuse, shapeless
    emberOpacity: 0.85,
    emberScale: 0.18, // small, bright, concentrated point
    stableOpacity: 0.55,
    stableScale: 1.0,
    idleBlur: 42,
    idlePulseBlur: 58,
    idlePulseDurationSec: 3.5,
    gatherOpacity: 0.85,
    gatherBlur: 34, // tighter, more intense during gather
    trailFadeDurationSec: sequenceDurations.launch,
  },

  ignition: {
    /** Number of vertical bands the 447 source paths are bucketed into. */
    bandCount: 26,
    /** Seconds each individual band takes to reveal. */
    bandRevealDurationSec: 0.5,
    /** Total stagger duration budget; bands distribute across this span. */
    totalStaggerBudgetSec: sequenceDurations.ignition - 0.5, // leaves room for the last band's own reveal duration
  },

  awaken: {
    // Brightness/scale "first breath" overshoot, distinct from the calm
    // settle that stabilize performs afterward.
    scaleOvershoot: 1.03,
    opacityOvershoot: 1,
  },

  rise: {
    startYPx: 160, // distance below resting position the phoenix starts from
    scaleFrom: 0.85,
    scaleTo: 1,
    ease: sequenceEasing.cinematicEaseOut,
  },

  /** Idle wing-beat cycle. Sub-phase durations sum to sequenceDurations.idleCycle. */
  flap: {
    anticipationDeg: -5, // small dip back before lifting
    liftDeg: 18,
    returnDeg: -10,
    anticipationDurationSec: 0.35,
    liftDurationSec: 0.55,
    holdDurationSec: 0.45,
    returnDurationSec: 0.9,
    pauseDurationSec: 0.6,
    ease: sequenceEasing.weightedEaseInOut,
    /** Where the wings hinge, as a % of the image box. */
    pivotX: 50,
    pivotY: 38,
    splitOverlapPct: 4,
  },

  idleBody: {
    floatDistancePx: 3,
    floatDurationSec: 3.8,
    breatheScaleFrom: 1.0,
    breatheScaleTo: 1.015,
    breatheDurationSec: 3.8,
  },

  gather: {
    leanDeg: -10,
    wingsDrawBackDeg: -14, // deeper than any idle anticipation dip
  },

  exit: {
    finalFlapDeg: 25,
    finalFlapDurationSec: 0.28,
    launchDistancePx: 900,
    launchEase: sequenceEasing.acceleratingEaseIn,
    fadeStartFraction: 0.4,
    trailOpacity: 0.5,
    trailScale: 1.35,
  },
} as const;

export type PhoenixConfig = typeof phoenixConfig;
