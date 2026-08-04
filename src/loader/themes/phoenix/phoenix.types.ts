import type { AnimationControls } from "framer-motion";

/**
 * The full set of independently-animated concerns for the phoenix theme.
 * This shape is specific to a winged creature — a future Company Logo
 * theme would define a much smaller controls type; a Dragon theme might
 * add a tail or fire-breath control. Each theme owns its own shape.
 */
export interface PhoenixControls {
  /** Ambient/pulsing/trailing radial light. */
  glow: AnimationControls;
  /** Drives the ignition band variants (see PhoenixIgnition.tsx). */
  ignition: AnimationControls;
  /** The whole-mark wrapper: position, scale, lean, launch, float, breathe. */
  body: AnimationControls;
  /** Left wing half (clip-path split of the source artwork). */
  wingLeft: AnimationControls;
  /** Right wing half (clip-path split of the source artwork). */
  wingRight: AnimationControls;
  /** Exit energy trail. */
  trail: AnimationControls;
}
