import type { PropsWithChildren } from "react";

/**
 * Purely a positioning shell: centers whatever the theme's Glow component
 * renders, behind the Body layer. Holds no animation logic or config of
 * its own — every theme's Glow content is free to be shaped completely
 * differently (a phoenix's soft radial bloom vs. a logo's flat halo).
 */
export function GlowSlot({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}
