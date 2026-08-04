import { AnimatePresence, motion } from "framer-motion";
import type { CinematicLoadingEngineProps } from "./sequence.types";
import { useCinematicSequence } from "./useCinematicSequence";
import { CameraStage } from "./camera/CameraStage";
import { GlowSlot } from "./stage/GlowSlot";
import { IgnitionSlot } from "./stage/IgnitionSlot";
import { BodySlot } from "./stage/BodySlot";
import { TrailSlot } from "./stage/TrailSlot";

/**
 * CinematicLoadingEngine
 *
 * The permanent, theme-agnostic orchestrator. This component — and only
 * this component — is what the rest of the app imports. Everything about
 * "what creature appears" is supplied via the `theme` prop; this file has
 * no knowledge of phoenixes, dragons, or logos.
 *
 * Usage:
 *   <CinematicLoadingEngine theme={phoenixTheme} isLoading={isLoading} onExitComplete={...} />
 */
export function CinematicLoadingEngine<TControls>({
  theme,
  isLoading,
  onExitComplete,
  maxLoadingTimeMs,
}: CinematicLoadingEngineProps<TControls>) {
  const {
    phase,
    isIgnitionVisible,
    isBodyVisible,
    isTrailVisible,
    themeControls,
    cameraControls,
    sceneOpacityControls,
  } = useCinematicSequence({ theme, isLoading, onExitComplete, maxLoadingTimeMs });

  if (phase === "done") return null;

  const { Glow, Ignition, Body, Trail } = theme;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      animate={sceneOpacityControls}
      initial={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <span className="sr-only">{`Loading ${theme.label}…`}</span>

      <CameraStage cameraControls={cameraControls}>
        <GlowSlot>
          <Glow controls={themeControls} />
        </GlowSlot>

        <AnimatePresence>
          {isIgnitionVisible && (
            <IgnitionSlot>
              <Ignition controls={themeControls} />
            </IgnitionSlot>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isBodyVisible && (
            <BodySlot>
              <Body controls={themeControls} />
            </BodySlot>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTrailVisible && (
            <TrailSlot>
              <Trail controls={themeControls} />
            </TrailSlot>
          )}
        </AnimatePresence>
      </CameraStage>
    </motion.div>
  );
}
