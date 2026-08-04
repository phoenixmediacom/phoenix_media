import { motion } from "framer-motion";
import type { PhoenixControls } from "../phoenix.types";
import { phoenixConfig as cfg } from "../phoenix.config";

interface PhoenixTrailProps {
  controls: PhoenixControls;
}

/**
 * A soft vertical streak that appears only during gather/launch, stretching
 * and fading as the phoenix accelerates upward — reads as residual energy
 * rather than a literal motion blur.
 */
export function PhoenixTrail({ controls }: PhoenixTrailProps) {
  const { width, height } = cfg.size;

  return (
    <motion.div
      animate={controls.trail}
      initial={{ opacity: 0, scale: 1 }}
      style={{
        position: "absolute",
        width: width * 0.5,
        height: height * 1.8,
        borderRadius: "50%",
        background: `linear-gradient(to top, ${cfg.glow.color}, transparent)`,
        filter: "blur(24px)",
        pointerEvents: "none",
      }}
    />
  );
}
