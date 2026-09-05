import { useCallback, useEffect, useRef, useState } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

const INTRO_DURATION_SECONDS = 15;

export function VideoIntro({ onComplete }: VideoIntroProps) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const complete = useCallback(() => {
    if (hasCompleted) return;
    setHasCompleted(true);
    onComplete();
  }, [hasCompleted, onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fallbackTimer: number | undefined;

    const tryUnmuteOnGesture = () => {
      // Only a real user gesture can safely unmute without Chrome pausing playback.
      if (video.muted) video.muted = false;
    };
    document.addEventListener("pointerdown", tryUnmuteOnGesture, { once: true });
    document.addEventListener("keydown", tryUnmuteOnGesture, { once: true });

    const startVideo = async () => {
      // Muted autoplay is guaranteed by browsers and is never paused afterward.
      video.muted = true;
      video.volume = 1;

      try {
        await video.play();
      } catch {
        // Playback is fully blocked; don't leave the intro stuck forever.
        fallbackTimer = window.setTimeout(() => {
          complete();
        }, 5000);
      }
    };

    void startVideo();

    return () => {
      document.removeEventListener("pointerdown", tryUnmuteOnGesture);
      document.removeEventListener("keydown", tryUnmuteOnGesture);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [complete]);

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={complete}
        onError={complete}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= INTRO_DURATION_SECONDS) {
            event.currentTarget.pause();
            complete();
          }
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "min(320px, 80vw)",
          height: "min(320px, 80vh)",
          margin: "auto",
          display: "block",
          objectFit: "contain",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}