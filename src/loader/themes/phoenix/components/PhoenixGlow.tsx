import { motion } from "framer-motion";
import type { PhoenixControls } from "../phoenix.types";
import { phoenixConfig as cfg } from "../phoenix.config";

interface PhoenixGlowProps {
  controls: PhoenixControls;
}

/**
 * The soft radial light behind the phoenix. Its opacity/scale/blur are
 * driven entirely by the sequence hook (heat → ember → stabilize → idle
 * pulse → gather → fade); this component only renders the visual.
 */
export function PhoenixGlow({ controls }: PhoenixGlowProps) {
  const { width, height } = cfg.size;

  return (
    <motion.div
      animate={controls.glow}
      initial={{ opacity: 0, scale: cfg.glow.heatScale }}
      style={{
        position: "absolute",
        width: width * 1.3,
        height: height * 1.3,
        borderRadius: "50%",
        backgroundColor: cfg.glow.color,
        filter: `blur(${cfg.glow.idleBlur}px)`,
        pointerEvents: "none",
      }}
    />
  );
}
