import { motion, type AnimationControls } from "framer-motion";
import type { PropsWithChildren } from "react";

interface CameraStageProps extends PropsWithChildren {
  cameraControls: AnimationControls;
}

/**
 * CameraStage
 *
 * The single DOM node the camera ever touches. Everything a theme renders
 * (Glow, Ignition, Body, Trail) is nested inside this wrapper, so the
 * camera's push-in/float/follow motion applies uniformly to the whole
 * scene without any theme component needing to know the camera exists.
 *
 * transform-origin is pinned to center so scale reads as a push toward the
 * subject rather than a crop from a corner.
 */
export function CameraStage({ cameraControls, children }: CameraStageProps) {
  return (
    <motion.div
      animate={cameraControls}
      initial={{ scale: 1, translateY: 0 }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        transformOrigin: "50% 50%",
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}
