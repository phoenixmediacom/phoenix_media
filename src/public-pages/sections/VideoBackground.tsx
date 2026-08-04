import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "../../services/types";

interface VideoBackgroundProps {
  source: VideoSource;
  muted: boolean;
  onToggleMute: () => void;
}

function toYouTubeEmbed(url: string, muted: boolean): string {
  const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  const id = idMatch?.[1] ?? url;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    controls: "0",
    loop: "1",
    playlist: id,
    playsinline: "1",
    modestbranding: "1",
    enablejsapi: "1",
    rel: "0",
    fs: "0",
    disablekb: "1",
    iv_load_policy: "3",
    showinfo: "0",
    cc_load_policy: "0",
  });
  if (typeof window !== "undefined") params.set("origin", window.location.origin);
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function toVimeoEmbed(url: string, muted: boolean): string {
  const idMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = idMatch?.[1] ?? url;
  const params = new URLSearchParams({
    autoplay: "1",
    muted: muted ? "1" : "0",
    loop: "1",
    background: "0",
    controls: "0",
  });
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

export function VideoBackground({ source, muted, onToggleMute }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedKey, setEmbedKey] = useState(0);

  // Native <video> mute is trivial: it's just a DOM property.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // For iframe embeds, best-effort postMessage to the platform's player.
  // Re-mounting the iframe on toggle (embedKey) guarantees the correct
  // initial mute param even if a postMessage command is missed.
  useEffect(() => {
    if (source.type === "youtube" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: muted ? "mute" : "unMute", args: [] }),
        "*",
      );
    }
    if (source.type === "vimeo" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: "setVolume", value: muted ? 0 : 1 }),
        "*",
      );
    }
  }, [muted, source.type]);

  function handleToggle() {
    onToggleMute();
    setEmbedKey((k) => k + 1);
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-container-lowest">
      {source.type === "upload" && (
        <video
          ref={videoRef}
          src={source.url}
          autoPlay
          muted={muted}
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {source.type === "youtube" && (
        <iframe
          key={embedKey}
          ref={iframeRef}
          src={toYouTubeEmbed(source.url, muted)}
          title="Background video"
          allow="autoplay; encrypted-media"
          className="absolute top-1/2 left-1/2 w-[177.78vh] h-[100vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />
      )}
      {source.type === "vimeo" && (
        <iframe
          key={embedKey}
          ref={iframeRef}
          src={toVimeoEmbed(source.url, muted)}
          title="Background video"
          allow="autoplay; encrypted-media"
          className="absolute top-1/2 left-1/2 w-[177.78vh] h-[100vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface" />
      <button
        onClick={handleToggle}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-8 end-8 z-20 h-11 w-11 rounded-full glass flex items-center justify-center text-on-surface hover:text-primary transition-colors"
      >
        {muted ? <MuteIcon /> : <UnmuteIcon />}
      </button>
    </div>
  );
}

function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
      <path d="m16 9 5 6M21 9l-5 6" strokeLinecap="round" />
    </svg>
  );
}
function UnmuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
      <path d="M16 8a5 5 0 0 1 0 8M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  );
}
