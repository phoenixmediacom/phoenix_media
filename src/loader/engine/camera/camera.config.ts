import type { CameraMagnitudeConfig } from "./camera.types";

/**
 * camera.config.ts
 *
 * Every value here is deliberately small. This file is the single place
 * to adjust "how much" the camera moves; camera.ts and useCinematicCamera
 * never contain a bare number. If the camera ever feels too strong (or too
 * weak), this is the only file that needs editing.
 *
 * Guiding ratios used while tuning these:
 * - Total push-in across heat→ignition is under 3% scale.
 * - Idle breathing is under half a percent — genuinely subliminal.
 * - Launch-follow is capped at 15% of travel distance, per spec.
 */
export const cameraConfig: CameraMagnitudeConfig = {
  heatScale: 1.008,
  emberScale: 1.016,
  ignitionScale: 1.024,
  awakenScale: 1.02, // tiny stabilizing pull-back from the ignition peak
  riseFloatPx: 1.5,
  idleBreathAmplitude: 0.0035,
  idleBreathDurationSec: 4.2,
  gatherScaleDelta: 0.006,
  launchFollowFraction: 0.13, // within the requested 10–15% range
};
