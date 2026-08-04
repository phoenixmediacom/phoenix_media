import type { PropsWithChildren } from "react";

/**
 * Positioning shell for the ignition ("awakening") layer. The engine
 * mounts this only for the void → awaken span of beats and unmounts it
 * once `awaken` completes, handing off to BodySlot — see
 * CinematicLoadingEngine.tsx for that lifecycle decision.
 */
export function IgnitionSlot({ children }: PropsWithChildren) {
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
