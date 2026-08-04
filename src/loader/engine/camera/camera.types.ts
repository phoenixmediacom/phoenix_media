/**
 * The camera's motion is expressed purely as `scale` (push-in/out) and
 * `translateY` (vertical drift/follow). No rotation, no skew, no shake —
 * deliberately, per the "premium, not gimmicky" requirement. Keeping the
 * type this narrow prevents future additions from accidentally introducing
 * a rotate/shake camera later.
 */
export interface CameraTransform {
  scale: number;
  translateY: number;
}

export interface CameraMagnitudeConfig {
  /** Scale reached by the end of `heat` (very first, barely-there push-in). */
  heatScale: number;
  /** Scale reached by the end of `ember`. */
  emberScale: number;
  /** Scale reached at the closest point, during `ignition`. */
  ignitionScale: number;
  /** Scale settled to after `awaken`'s tiny stabilization. */
  awakenScale: number;
  /** Peak amplitude, in px, of the near-imperceptible float during `rise`. */
  riseFloatPx: number;
  /** Peak amplitude of the idle "breathing" scale oscillation (e.g. 0.004 = ±0.4%). */
  idleBreathAmplitude: number;
  /** Seconds per idle breathing cycle. */
  idleBreathDurationSec: number;
  /** Additional forward push during `gather`, added on top of ignitionScale. */
  gatherScaleDelta: number;
  /**
   * Fraction (0–1) of the phoenix's total launch travel distance the
   * camera follows before settling back. Per spec: 10–15%.
   */
  launchFollowFraction: number;
}
