import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import phoenixSvgRaw from "../assets/phoenix.svg?raw";
import { extractPaths, bucketPathsIntoBands, filterOutBackgroundArtifacts } from "../../../utils/svgGeometry";
import type { PhoenixControls } from "../phoenix.types";
import { phoenixConfig as cfg } from "../phoenix.config";

interface PhoenixIgnitionProps {
  controls: PhoenixControls;
}

/**
 * PhoenixIgnition
 *
 * Scene "ignition": reveals the phoenix's actual vector paths, bottom band
 * first, each band fading/scaling in using its own real fill color from
 * the source artwork — not a raster gradient mask. See the note in
 * svgGeometry.ts for why bands (not all 447 individual paths) are used.
 *
 * Mounted only for the void→awaken span of beats; unmounted afterward
 * (see useCinematicSequence's isIgnitionVisible), since its job is done
 * once PhoenixBody takes over.
 */
export function PhoenixIgnition({ controls }: PhoenixIgnitionProps) {
  const bands = useMemo(() => {
    try {
      const paths = extractPaths(phoenixSvgRaw);
      const cleanedPaths = filterOutBackgroundArtifacts(
        paths,
        cfg.svgViewBoxWidth,
        cfg.svgViewBoxHeight,
      );
      if (cleanedPaths.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(
          "[PhoenixIgnition] No <path> elements matched in phoenix.svg — " +
            "the ignition reveal will be skipped. If you replaced the " +
            "source SVG, check that it contains standard <path d=... fill=...> " +
            "elements (not embedded raster <image> data, and not paths whose " +
            "color comes only from a parent <g fill=...> or a <style> block).",
        );
        return [];
      }
      return bucketPathsIntoBands(
        cleanedPaths,
        cfg.ignition.bandCount,
        cfg.svgViewBoxHeight,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[PhoenixIgnition] Failed to parse phoenix.svg:", error);
      return [];
    }
  }, []);

  const bandCount = bands.length || 1;
  const perBandDelay = cfg.ignition.totalStaggerBudgetSec / bandCount;

  const bandVariants: Variants = {
    hidden: { opacity: 0, scale: 0.985 },
    revealed: (verticalPosition: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        // verticalPosition: 0 = bottom band, 1 = top band — bottom reveals first.
        delay: verticalPosition * perBandDelay,
        duration: cfg.ignition.bandRevealDurationSec,
        ease: "easeOut",
      },
    }),
  };

  const { width, height } = cfg.size;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${cfg.svgViewBoxWidth} ${cfg.svgViewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {bands.map((band, index) => (
        <motion.g
          key={index}
          custom={band.verticalPosition}
          variants={bandVariants}
          initial="hidden"
          animate={controls.ignition}
          style={{ transformOrigin: "50% 50%" }}
        >
          {band.paths.map((path, pathIndex) => (
            <path key={pathIndex} d={path.d} fill={path.fill} />
          ))}
        </motion.g>
      ))}
    </svg>
  );
}
