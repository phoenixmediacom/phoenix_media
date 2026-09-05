"use client";

import * as React from "react";
import { motion } from "motion/react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface LoaderSkeletonProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "color"> {
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
  borderRadius?: React.CSSProperties["borderRadius"];
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}

export function LoaderSkeleton({
  className,
  width = "100%",
  height = 20,
  borderRadius = 4,
  baseColor,
  highlightColor,
  duration = 1.5,
  style,
  ...props
}: LoaderSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
      style={{
        width,
        height,
        borderRadius,
        ...(baseColor && { backgroundColor: baseColor }),
        ...style,
      }}
      {...props}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${
            highlightColor || "rgba(255, 255, 255, 0.3)"
          }, transparent)`,
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
}

export default LoaderSkeleton;
