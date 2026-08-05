import Lightfall from "../../components/backgrounds/Lightfall";
import Prism from "../../components/backgrounds/Prism";

export type BackgroundVariant = "lightfall" | "prism" | "none";

export function AnimatedBackground({ variant }: { variant: BackgroundVariant }) {
  if (variant === "none") return null;

  if (variant === "lightfall") {
    return (
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 w-full h-full">
          <Lightfall
            className="w-full h-full"
            colors={["#ffb59e", "#ff571a", "#ffba26"]}
            backgroundColor="#131315"
            speed={0.5}
            streakCount={3}
            streakWidth={1}
            streakLength={1.1}
            glow={1}
            density={0.6}
            twinkle={1}
            zoom={3}
            backgroundGlow={0.35}
            opacity={0.9}
            mouseInteraction
            mouseStrength={0.4}
            mouseRadius={1}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-transparent to-surface pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 w-full h-full">
        <Prism
          animationType="rotate"
          timeScale={0.35}
          height={3.5}
          baseWidth={5.5}
          scale={3.4}
          hueShift={0.08}
          colorFrequency={1}
          noise={0.25}
          glow={1}
          bloom={1.1}
          suspendWhenOffscreen
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-transparent to-surface pointer-events-none" />
    </div>
  );
}