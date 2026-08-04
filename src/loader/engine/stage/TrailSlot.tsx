import type { PropsWithChildren } from "react";

/**
 * Positioning shell for the exit energy trail, mounted only during
 * `gather`/`launch`. Sits behind the body (lower z-index) so the trail
 * reads as being left behind rather than drawn over the creature.
 */
export function TrailSlot({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}
