import type { PropsWithChildren } from "react";

/**
 * Positioning shell for the creature/mark itself, mounted starting at
 * `rise` and remaining for the rest of the sequence (idle, gather, launch).
 */
export function BodySlot({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}
