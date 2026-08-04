import { motion } from "framer-motion";
import phoenixSvgUrl from "../assets/phoenix.svg";
import type { PhoenixControls } from "../phoenix.types";
import { phoenixConfig as cfg } from "../phoenix.config";

interface PhoenixBodyProps {
  controls: PhoenixControls;
}

/**
 * PhoenixBody
 *
 * Renders the phoenix from `rise` onward. The source artwork has no
 * separate wing layers, so — as established in the earlier PNG-based
 * version of this component — the wings are approximated by duplicating
 * the full image and using clip-path to isolate a left half and right
 * half, each rotating from a shared pivot near the shoulder. Nothing is
 * redrawn, stretched, or distorted: each half is a 1:1 crop of the
 * original artwork.
 *
 * `controls.body` drives the whole mark's position/scale/lean/launch;
 * `controls.wingLeft` / `controls.wingRight` drive only the rotation of
 * each clipped half.
 */
export function PhoenixBody({ controls }: PhoenixBodyProps) {
  const { width, height } = cfg.size;
  const { pivotX, pivotY, splitOverlapPct: overlap } = cfg.flap;
  const pivot = `${pivotX}% ${pivotY}%`;

  const leftClip = `polygon(0% 0%, ${50 + overlap}% 0%, ${50 + overlap}% 100%, 0% 100%)`;
  const rightClip = `polygon(${50 - overlap}% 0%, 100% 0%, 100% 100%, ${50 - overlap}% 100%)`;

  const imgBaseStyle: React.CSSProperties = {
    width,
    height,
    objectFit: "contain",
    display: "block",
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <motion.div
      animate={controls.body}
      initial={{ y: cfg.rise.startYPx, scale: cfg.rise.scaleFrom, opacity: 0, rotate: 0 }}
      style={{ position: "relative", width, height }}
    >
      <motion.img
        src={phoenixSvgUrl}
        alt=""
        aria-hidden="true"
        animate={controls.wingLeft}
        initial={{ rotate: 0 }}
        style={{
          ...imgBaseStyle,
          position: "absolute",
          top: 0,
          left: 0,
          clipPath: leftClip,
          transformOrigin: pivot,
        }}
      />
      <motion.img
        src={phoenixSvgUrl}
        alt=""
        aria-hidden="true"
        animate={controls.wingRight}
        initial={{ rotate: 0 }}
        style={{
          ...imgBaseStyle,
          position: "absolute",
          top: 0,
          left: 0,
          clipPath: rightClip,
          transformOrigin: pivot,
        }}
      />
    </motion.div>
  );
}
