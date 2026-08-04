import { useEffect, useRef, useState } from "react";
import { useAnimationControls } from "framer-motion";
import type { CinematicBeat, CinematicTheme } from "./sequence.types";
import {
  sequenceSafety,
  reducedMotionDefaults,
  exitTransition,
} from "./sequence.defaults";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useLoadingTimeout } from "../hooks/useLoadingTimeout";
import { useCinematicCamera } from "./camera/useCinematicCamera";

export interface UseCinematicSequenceArgs<TControls> {
  theme: CinematicTheme<TControls>;
  isLoading: boolean;
  onExitComplete?: () => void;
  maxLoadingTimeMs?: number;
}

export interface UseCinematicSequenceResult<TControls> {
  phase: CinematicBeat;
  /** True for the void→awaken span; engine unmounts Ignition after this. */
  isIgnitionVisible: boolean;
  /** True from `rise` onward; engine mounts Body starting here. */
  isBodyVisible: boolean;
  /** True only during gather/launch. */
  isTrailVisible: boolean;
  isReducedMotion: boolean;
  themeControls: TControls;
  cameraControls: ReturnType<typeof useCinematicCamera>["cameraControls"];
  /** Master fade applied to the whole scene (backdrop + everything inside)
   *  so the bird, glow, and trail always disappear together as one unit. */
  sceneOpacityControls: ReturnType<typeof useAnimationControls>;
}

/**
 * useCinematicSequence
 *
 * Drives the beat-by-beat progression for ANY theme. This file must never
 * import from `themes/` — that boundary is what makes the engine reusable.
 *
 * Responsibilities:
 * - Runs beats in the fixed order defined by CinematicBeat, awaiting each
 *   theme beat player alongside the matching camera beat player.
 * - Owns the idle loop and the rule that loading-complete is only checked
 *   at an idle cycle boundary, never mid-cycle.
 * - Branches to a fully separate, simplified reduced-motion path.
 * - Enforces a maximum loading time via useLoadingTimeout so the sequence
 *   can never hang indefinitely.
 * - Cancels all in-flight work on unmount (guards every async step with a
 *   `cancelled` flag and calls `theme.stopAll()` / camera stop).
 */
export function useCinematicSequence<TControls>({
  theme,
  isLoading,
  onExitComplete,
  maxLoadingTimeMs = sequenceSafety.maxLoadingTimeMs,
}: UseCinematicSequenceArgs<TControls>): UseCinematicSequenceResult<TControls> {
  const [phase, setPhase] = useState<CinematicBeat>("void");
  const isReducedMotion = usePrefersReducedMotion();

  const { controls: themeControls, players } = theme.useSequence();
  const { cameraControls, players: cameraPlayers } = useCinematicCamera();
  const sceneOpacityControls = useAnimationControls();

  const isLoadingRef = useRef(isLoading);
  const forceExitRef = useRef(false);
  isLoadingRef.current = isLoading;

  // Force-exit safety net: fires if isLoading never resolves in time.
  useLoadingTimeout(true, maxLoadingTimeMs, () => {
    forceExitRef.current = true;
  });

  useEffect(() => {
    // No "has it already started" guard here on purpose. React Strict
    // Mode (dev only) intentionally runs this effect as
    // mount -> cleanup -> mount again, on the same component instance.
    // The correct, StrictMode-safe pattern is: let the first mount start
    // the sequence, let cleanup cancel it via the `cancelled` flag below,
    // and let the second mount start a fresh, uncancelled run. Guarding
    // against re-entry here (e.g. with a ref) breaks that pattern: the
    // first run gets cancelled and the second run never starts, silently
    // freezing every animation at its initial value with no error.
    let cancelled = false;
    const guard = <T,>(promise: Promise<T>) =>
      promise.then((value) => {
        if (cancelled) throw new Error("cinematic-sequence-cancelled");
        return value;
      });

    async function runReducedMotionSequence() {
      setPhase("void");
      await guard(
        new Promise<void>((resolve) =>
          setTimeout(resolve, reducedMotionDefaults.holdDuration * 1000),
        ),
      );
      if (cancelled) return;

      setPhase("rise");
      if (players.playReducedMotionReveal) {
        await guard(players.playReducedMotionReveal());
      } else {
        // Generic engine-level fallback: a plain fade, nothing else.
        cameraPlayers.reset();
        await guard(
          new Promise<void>((resolve) =>
            setTimeout(
              resolve,
              reducedMotionDefaults.fadeInDuration * 1000,
            ),
          ),
        );
      }
      if (cancelled) return;

      // Skip straight to waiting for isLoading, then straight to launch.
      setPhase("idle");
      await guard(waitForLoadingToResolve());
      if (cancelled) return;

      setPhase("launch");
      await guard(players.playLaunch());
      if (cancelled) return;

      await guard(
        sceneOpacityControls.start({
          opacity: 0,
          transition: {
            duration: exitTransition.sceneFadeDurationSec,
            ease: "easeInOut",
          },
        }),
      );
      if (cancelled) return;

      setPhase("done");
      onExitComplete?.();
    }

    function waitForLoadingToResolve(): Promise<void> {
      return new Promise((resolve) => {
        const check = () => {
          if (cancelled) return resolve();
          if (forceExitRef.current || !isLoadingRef.current) {
            resolve();
            return;
          }
          // Poll at the idle cycle boundary cadence rather than reacting
          // mid-animation — this is what guarantees a flap is never cut
          // off mid-motion (checked again inside runFullSequence's loop).
          setTimeout(check, 250);
        };
        check();
      });
    }

    async function runFullSequence() {
      setPhase("void");
      await guard(Promise.resolve(players.playVoid()));
      if (cancelled) return;

      setPhase("heat");
      await guard(Promise.all([players.playHeat(), cameraPlayers.playHeat()]));
      if (cancelled) return;

      setPhase("ember");
      await guard(
        Promise.all([players.playEmber(), cameraPlayers.playEmber()]),
      );
      if (cancelled) return;

      setPhase("ignition");
      await guard(
        Promise.all([players.playIgnition(), cameraPlayers.playIgnition()]),
      );
      if (cancelled) return;

      setPhase("awaken");
      await guard(
        Promise.all([players.playAwaken(), cameraPlayers.playAwaken()]),
      );
      if (cancelled) return;

      setPhase("stabilize");
      await guard(
        Promise.all([players.playStabilize(), cameraPlayers.playStabilize()]),
      );
      if (cancelled) return;

      // Ignition layer is done contributing — Body takes over from here.
      setPhase("rise");
      await guard(Promise.all([players.playRise(), cameraPlayers.playRise()]));
      if (cancelled) return;

      setPhase("idle");
      cameraPlayers.startIdleBreathing();
      // Loop idle cycles; only re-check the loading gate between cycles,
      // and never break before the guaranteed minimum has played — this
      // is what keeps the flap visible even when isLoading resolves
      // almost instantly (a very fast API response shouldn't mean the
      // person never actually sees a wingbeat).
      let idleCyclesPlayed = 0;
      while (!cancelled) {
        await guard(players.playIdleCycle());
        if (cancelled) return;
        idleCyclesPlayed += 1;
        const minimumMet = idleCyclesPlayed >= sequenceSafety.minimumIdleCycles;
        if (minimumMet && (forceExitRef.current || !isLoadingRef.current)) {
          break;
        }
      }
      cameraPlayers.stopIdleBreathing();
      if (cancelled) return;

      setPhase("gather");
      await guard(
        Promise.all([players.playGather(), cameraPlayers.playGather()]),
      );
      if (cancelled) return;

      setPhase("launch");
      await guard(
        Promise.all([players.playLaunch(), cameraPlayers.playLaunch()]),
      );
      if (cancelled) return;

      // Everything the theme/camera did above was positional (fly up,
      // camera follow) — none of it should have faded opacity on its own.
      // This single fade is what makes the bird, glow, and trail disappear
      // together, guaranteed, rather than relying on several independently
      // tuned opacity curves happening to line up.
      await guard(
        sceneOpacityControls.start({
          opacity: 0,
          transition: {
            duration: exitTransition.sceneFadeDurationSec,
            ease: "easeInOut",
          },
        }),
      );
      if (cancelled) return;

      setPhase("done");
      onExitComplete?.();
    }

    if (isReducedMotion) {
      runReducedMotionSequence().catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.message === "cinematic-sequence-cancelled"
        ) {
          return; // expected on unmount/theme swap — not a real failure
        }
        // eslint-disable-next-line no-console
        console.error(
          "[CinematicLoadingEngine] reduced-motion sequence failed:",
          error,
        );
      });
    } else {
      runFullSequence().catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.message === "cinematic-sequence-cancelled"
        ) {
          return; // expected on unmount/theme swap — not a real failure
        }
        // eslint-disable-next-line no-console
        console.error("[CinematicLoadingEngine] sequence failed:", error);
      });
    }

    return () => {
      cancelled = true;
      players.stopAll();
      cameraControls.stop();
      sceneOpacityControls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReducedMotion]);

  const isIgnitionVisible =
    phase === "void" ||
    phase === "heat" ||
    phase === "ember" ||
    phase === "ignition" ||
    phase === "awaken" ||
    phase === "stabilize";

  const isBodyVisible =
    phase === "rise" ||
    phase === "idle" ||
    phase === "gather" ||
    phase === "launch";

  const isTrailVisible = phase === "gather" || phase === "launch";

  return {
    phase,
    isIgnitionVisible,
    isBodyVisible,
    isTrailVisible,
    isReducedMotion,
    themeControls,
    cameraControls,
    sceneOpacityControls,
  };
}
