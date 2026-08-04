import { useMemo } from "react";
import { useAnimationControls } from "framer-motion";
import type { CameraBeatPlayers } from "../sequence.types";
import { sequenceDurations, sequenceEasing } from "../sequence.defaults";
import { cameraConfig } from "./camera.config";

/**
 * useCinematicCamera
 *
 * A theme-independent "camera" that every theme automatically benefits
 * from. It owns exactly one AnimationControls instance applied to a
 * wrapping stage div (see CameraStage.tsx) and exposes one imperative
 * function per beat, mirroring the shape of a theme's beat players so the
 * engine can drive both in parallel with a single `Promise.all`.
 *
 * Motion is restricted to `scale` and `translateY` only — never rotation,
 * never a shake/jitter pattern — per the "felt, not seen" requirement.
 * All magnitudes come from camera.config.ts; this file only sequences them.
 */
export function useCinematicCamera(): {
  cameraControls: ReturnType<typeof useAnimationControls>;
  players: CameraBeatPlayers;
} {
  const cameraControls = useAnimationControls();

  const players = useMemo<CameraBeatPlayers>(() => {
    return {
      async playHeat() {
        await cameraControls.start({
          scale: cameraConfig.heatScale,
          transition: {
            duration: sequenceDurations.heat,
            ease: sequenceEasing.weightedEaseInOut,
          },
        });
      },

      async playEmber() {
        await cameraControls.start({
          scale: cameraConfig.emberScale,
          transition: {
            duration: sequenceDurations.ember,
            ease: sequenceEasing.weightedEaseInOut,
          },
        });
      },

      async playIgnition() {
        await cameraControls.start({
          scale: cameraConfig.ignitionScale,
          transition: {
            duration: sequenceDurations.ignition,
            ease: sequenceEasing.weightedEaseInOut,
          },
        });
      },

      async playAwaken() {
        // Tiny stabilizing pull-back from the ignition peak — the camera
        // "settling its breath" alongside the creature's first breath.
        await cameraControls.start({
          scale: cameraConfig.awakenScale,
          transition: {
            duration: sequenceDurations.awaken,
            ease: sequenceEasing.cinematicEaseOut,
          },
        });
      },

      async playStabilize() {
        // No further push — camera holds. Present for interface symmetry
        // and so a future theme's timing changes don't require engine edits.
        await cameraControls.start({
          scale: cameraConfig.awakenScale,
          transition: {
            duration: sequenceDurations.stabilize,
            ease: sequenceEasing.cinematicEaseOut,
          },
        });
      },

      async playRise() {
        // Near-still, with an extremely subtle float layered on top of
        // whatever position the stage is already in.
        await cameraControls.start({
          translateY: [0, -cameraConfig.riseFloatPx, 0],
          transition: {
            duration: sequenceDurations.rise,
            ease: sequenceEasing.cinematicEaseOut,
          },
        });
      },

      startIdleBreathing() {
        // Fire-and-forget infinite loop — the engine does not await this;
        // it's stopped explicitly when idle ends (see stopIdleBreathing).
        void cameraControls.start({
          scale: [
            cameraConfig.awakenScale,
            cameraConfig.awakenScale + cameraConfig.idleBreathAmplitude,
            cameraConfig.awakenScale,
          ],
          transition: {
            duration: cameraConfig.idleBreathDurationSec,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          },
        });
      },

      stopIdleBreathing() {
        cameraControls.stop();
      },

      async playGather() {
        await cameraControls.start({
          scale: cameraConfig.awakenScale + cameraConfig.gatherScaleDelta,
          transition: {
            duration: sequenceDurations.gather,
            ease: sequenceEasing.weightedEaseInOut,
          },
        });
      },

      async playLaunch() {
        // The camera doesn't know the theme's exact launch distance in
        // pixels — it follows a fraction of *its own* travel budget, which
        // reads as "following" without needing to be coupled to the
        // theme's body-controls implementation. It follows up, then
        // settles most of the way back down before the engine unmounts.
        const followDistance =
          cameraConfig.riseFloatPx * 0 + // keep unit consistent with translateY
          120 * cameraConfig.launchFollowFraction; // 120px reference travel budget

        await cameraControls.start({
          translateY: [0, -followDistance, -followDistance * 0.2],
          scale: [
            cameraConfig.awakenScale + cameraConfig.gatherScaleDelta,
            cameraConfig.awakenScale + cameraConfig.gatherScaleDelta * 0.4,
            1,
          ],
          transition: {
            duration: sequenceDurations.launch,
            ease: [
              sequenceEasing.acceleratingEaseIn,
              sequenceEasing.cinematicEaseOut,
            ],
            times: [0, 0.55, 1],
          },
        });
      },

      reset() {
        cameraControls.set({ scale: 1, translateY: 0 });
      },
    };
  }, [cameraControls]);

  return { cameraControls, players };
}
