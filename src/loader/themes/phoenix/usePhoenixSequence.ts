import { useMemo } from "react";
import { useAnimationControls } from "framer-motion";
import type {
  CinematicBeatPlayers,
  CinematicThemeSequence,
} from "../../engine/sequence.types";
import { sequenceEasing } from "../../engine/sequence.defaults";
import type { PhoenixControls } from "./phoenix.types";
import { phoenixConfig as cfg } from "./phoenix.config";

/**
 * usePhoenixSequence
 *
 * Implements the engine's CinematicBeatPlayers contract for the phoenix.
 * This is the only file that translates the phoenix's config into actual
 * Framer Motion imperative calls — the engine never sees any of this
 * directly, it only calls the returned `players` functions in order.
 */
export function usePhoenixSequence(): CinematicThemeSequence<PhoenixControls> {
  const glow = useAnimationControls();
  const ignition = useAnimationControls();
  const body = useAnimationControls();
  const wingLeft = useAnimationControls();
  const wingRight = useAnimationControls();
  const trail = useAnimationControls();

  const players = useMemo<CinematicBeatPlayers>(() => {
    async function playIdleFlapCycle() {
      const { flap } = cfg;
      const mirror = (deg: number) => -deg;

      // Anticipation — small dip back, gathering force.
      await Promise.all([
        wingLeft.start({
          rotate: flap.anticipationDeg,
          transition: { duration: flap.anticipationDurationSec, ease: flap.ease },
        }),
        wingRight.start({
          rotate: mirror(flap.anticipationDeg),
          transition: { duration: flap.anticipationDurationSec, ease: flap.ease },
        }),
      ]);

      // Lift — powerful upward drive.
      await Promise.all([
        wingLeft.start({
          rotate: flap.liftDeg,
          transition: { duration: flap.liftDurationSec, ease: flap.ease },
        }),
        wingRight.start({
          rotate: mirror(flap.liftDeg),
          transition: { duration: flap.liftDurationSec, ease: flap.ease },
        }),
      ]);

      // Hold — the "majestic" beat, near-frozen at the peak.
      await Promise.all([
        wingLeft.start({
          rotate: flap.liftDeg,
          transition: { duration: flap.holdDurationSec, ease: "linear" },
        }),
        wingRight.start({
          rotate: mirror(flap.liftDeg),
          transition: { duration: flap.holdDurationSec, ease: "linear" },
        }),
      ]);

      // Return — heavier, slower than the lift; gravity, not effort.
      await Promise.all([
        wingLeft.start({
          rotate: flap.returnDeg,
          transition: { duration: flap.returnDurationSec, ease: flap.ease },
        }),
        wingRight.start({
          rotate: mirror(flap.returnDeg),
          transition: { duration: flap.returnDurationSec, ease: flap.ease },
        }),
      ]);

      // Pause — full rest before the next cycle.
      await Promise.all([
        wingLeft.start({
          rotate: 0,
          transition: { duration: flap.pauseDurationSec, ease: "easeOut" },
        }),
        wingRight.start({
          rotate: 0,
          transition: { duration: flap.pauseDurationSec, ease: "easeOut" },
        }),
      ]);
    }

    return {
      playVoid() {
        body.set({ opacity: 0 });
        glow.set({ opacity: 0, scale: cfg.glow.heatScale });
        ignition.set({ opacity: 0 });
        trail.set({ opacity: 0 });
      },

      async playHeat() {
        // Diffuse, shapeless warmth — no defined point yet.
        await glow.start({
          opacity: cfg.glow.heatOpacity,
          scale: cfg.glow.heatScale,
          transition: { duration: 0.9, ease: "easeOut" },
        });
      },

      async playEmber() {
        // A single small, bright point ignites — the literal origin the
        // ignition reveal will radiate from.
        await glow.start({
          opacity: cfg.glow.emberOpacity,
          scale: cfg.glow.emberScale,
          transition: { duration: 0.5, ease: sequenceEasing.weightedEaseInOut },
        });
      },

      async playIgnition() {
        ignition.set({ opacity: 1 });
        // Bands reveal via their own variants (custom-driven stagger) —
        // see PhoenixIgnition.tsx. Triggering "revealed" here animates all
        // connected band elements simultaneously, each with its own delay.
        await ignition.start("revealed");
      },

      async playAwaken() {
        // A distinct "first breath" impulse — brightness + scale overshoot
        // — separate in feeling from the calm settle that follows.
        await Promise.all([
          glow.start({
            opacity: cfg.awaken.opacityOvershoot,
            scale: cfg.awaken.scaleOvershoot,
            transition: { duration: 0.4, ease: "easeOut" },
          }),
          body.start({
            opacity: 1,
            scale: cfg.awaken.scaleOvershoot,
            transition: { duration: 0.4, ease: "easeOut" },
          }),
        ]);
      },

      async playStabilize() {
        await Promise.all([
          glow.start({
            opacity: cfg.glow.stableOpacity,
            scale: cfg.glow.stableScale,
            transition: { duration: 0.5, ease: sequenceEasing.cinematicEaseOut },
          }),
          body.start({
            scale: 1,
            transition: { duration: 0.5, ease: sequenceEasing.cinematicEaseOut },
          }),
        ]);
      },

      async playRise() {
        body.set({ y: cfg.rise.startYPx, scale: cfg.rise.scaleFrom });
        await body.start({
          y: 0,
          scale: cfg.rise.scaleTo,
          transition: {
            duration: 1.6,
            ease: cfg.rise.ease,
          },
        });
      },

      async playIdleCycle() {
        // Wing beat and body float/breathe run concurrently but are
        // intentionally independent loops in feel — float uses its own
        // duration rather than being locked to the flap cycle length.
        await Promise.all([
          playIdleFlapCycle(),
          body.start({
            y: [0, -cfg.idleBody.floatDistancePx, 0],
            scale: [
              cfg.idleBody.breatheScaleFrom,
              cfg.idleBody.breatheScaleTo,
              cfg.idleBody.breatheScaleFrom,
            ],
            transition: {
              duration: cfg.idleBody.floatDurationSec,
              ease: "easeInOut",
            },
          }),
          // Glow pulses on its own cadence, independent of both the wing
          // cycle and the body float — this is deliberate: locking it to
          // either would make the loop feel mechanical rather than alive.
          glow.start({
            filter: [
              `blur(${cfg.glow.idleBlur}px)`,
              `blur(${cfg.glow.idlePulseBlur}px)`,
              `blur(${cfg.glow.idleBlur}px)`,
            ],
            transition: {
              duration: cfg.glow.idlePulseDurationSec,
              ease: "easeInOut",
            },
          }),
        ]);
      },

      async playGather() {
        const { gather } = cfg;
        await Promise.all([
          body.start({
            rotate: gather.leanDeg,
            transition: { duration: 0.6, ease: "easeOut" },
          }),
          wingLeft.start({
            rotate: gather.wingsDrawBackDeg,
            transition: { duration: 0.6, ease: "easeOut" },
          }),
          wingRight.start({
            rotate: -gather.wingsDrawBackDeg,
            transition: { duration: 0.6, ease: "easeOut" },
          }),
          glow.start({
            opacity: cfg.glow.gatherOpacity,
            filter: `blur(${cfg.glow.gatherBlur}px)`,
            transition: { duration: 0.6, ease: "easeOut" },
          }),
        ]);
      },

      async playLaunch() {
        const { exit } = cfg;

        // One final, more powerful flap than any idle beat.
        await Promise.all([
          wingLeft.start({
            rotate: -exit.finalFlapDeg,
            transition: { duration: exit.finalFlapDurationSec, ease: "easeOut" },
          }),
          wingRight.start({
            rotate: exit.finalFlapDeg,
            transition: { duration: exit.finalFlapDurationSec, ease: "easeOut" },
          }),
        ]);

        // Accelerate off-screen while the trail stretches/dissolves behind
        // it. Note: body and glow deliberately do NOT fade their own
        // opacity here — the engine's unified scene fade (which runs after
        // this positional motion completes) is what makes everything
        // disappear together, guaranteed, rather than relying on several
        // independently-tuned opacity curves happening to land at zero
        // at the same instant.
        await Promise.all([
          body.start({
            y: -exit.launchDistancePx,
            rotate: 0,
            transition: {
              duration: 1.1,
              ease: exit.launchEase,
            },
          }),
          trail.start({
            opacity: [exit.trailOpacity, 0],
            scale: [1, exit.trailScale],
            transition: { duration: 1.1, ease: "easeOut" },
          }),
        ]);
      },

      async playReducedMotionReveal() {
        // Deliberately minimal: no ignition stagger, no wing loop, no
        // launch — a single respectful fade.
        body.set({ y: 0, scale: 1, opacity: 0 });
        glow.set({ opacity: 0, scale: 1 });
        await Promise.all([
          body.start({ opacity: 1, transition: { duration: 0.6 } }),
          glow.start({
            opacity: cfg.glow.stableOpacity,
            transition: { duration: 0.6 },
          }),
        ]);
      },

      stopAll() {
        glow.stop();
        ignition.stop();
        body.stop();
        wingLeft.stop();
        wingRight.stop();
        trail.stop();
      },
    };
  }, [glow, ignition, body, wingLeft, wingRight, trail]);

  return {
    controls: { glow, ignition, body, wingLeft, wingRight, trail },
    players,
  };
}
