import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "../../services/types";

interface VideoBackgroundProps {
  source: VideoSource;
  muted: boolean;
  onToggleMute: () => void;
}

// ✅ YouTube Embed - محسّن
function toYouTubeEmbed(url: string, muted: boolean): string {
  const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  const id = idMatch?.[1] ?? url;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    controls: "0",
    loop: "1",
    playlist: id,
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
    fs: "0",
    disablekb: "1",
    iv_load_policy: "3",
    showinfo: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

// ✅ Vimeo Embed - محسّن
function toVimeoEmbed(url: string, muted: boolean): string {
  const idMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = idMatch?.[1] ?? url;
  const params = new URLSearchParams({
    autoplay: "1",
    muted: muted ? "1" : "0",
    loop: "1",
    background: "1",
    controls: "0",
    title: "0",
    byline: "0",
    portrait: "0",
  });
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

// ✅ Cloudinary Direct URL
function getCloudinaryDirectUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('player.cloudinary.com')) {
      const cloudName = urlObj.searchParams.get('cloud_name');
      const publicId = urlObj.searchParams.get('public_id');
      if (cloudName && publicId) {
        return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function VideoBackground({ source, muted, onToggleMute }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedKey, setEmbedKey] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);

  // ✅ تحديث muted للفيديو المباشر
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // ✅ تحميل YouTube IFrame API
  useEffect(() => {
    if (source.type === "youtube") {
      // ✅ فحص إذا كان YT موجود بالفعل
      if (typeof window !== 'undefined' && !window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      }
    }
  }, [source.type]);

  // ✅ إشعار جاهزية iframe
  useEffect(() => {
    const handleLoad = () => setIframeReady(true);
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, [embedKey]);

  // ✅ التحكم في صوت YouTube/Vimeo عبر postMessage
  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentWindow) return;
  
    const iframe = iframeRef.current;
    const contentWindow = iframe.contentWindow;
  
    // ✅ فحص إذا كان contentWindow موجود
    if (!contentWindow) {
      console.warn('iframe contentWindow is null');
      return;
    }
  
    if (source.type === "youtube") {
      // YouTube IFrame API
      try {
        contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: muted ? "mute" : "unMute",
            args: []
          }),
          "*"
        );
      } catch (error) {
        console.error('Failed to send YouTube postMessage:', error);
      }
    }
  
    if (source.type === "vimeo") {
      // Vimeo Player API
      try {
        contentWindow.postMessage(
          JSON.stringify({
            method: "setVolume",
            value: muted ? 0 : 1
          }),
          "*"
        );
      } catch (error) {
        console.error('Failed to send Vimeo postMessage:', error);
      }
    }
  }, [muted, source.type, iframeReady]);

  function handleToggle() {
    onToggleMute();
    // إعادة تحميل iframe عند تغيير الصوت
    if (["youtube", "vimeo"].includes(source.type)) {
      setIframeReady(false);
      setEmbedKey((k) => k + 1);
    }
  }

  if (!source?.url) return null;

  const coverClass = "absolute inset-0 w-full h-full object-cover";
  const iframeCoverClass = "absolute top-1/2 left-1/2 w-[100vw] h-[100vh] min-w-[177.78vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0";

  const directUrl = source.type === "upload" 
    ? getCloudinaryDirectUrl(source.url) || source.url 
    : source.url;

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-container-lowest">
      
      {/* ✅ Upload - Cloudinary/Direct Video */}
      {source.type === "upload" && (
        <video
          ref={videoRef}
          src={directUrl}
          autoPlay
          muted={muted}
          loop
          playsInline
          className={coverClass}
          onError={(e) => console.error("Video error:", e)}
        />
      )}

      {/* ✅ YouTube */}
      {source.type === "youtube" && (
        <iframe
          key={embedKey}
          ref={iframeRef}
          src={toYouTubeEmbed(source.url, muted)}
          title="YouTube Background"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className={iframeCoverClass}
        />
      )}

      {/* ✅ Vimeo */}
      {source.type === "vimeo" && (
        <iframe
          key={embedKey}
          ref={iframeRef}
          src={toVimeoEmbed(source.url, muted)}
          title="Vimeo Background"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className={iframeCoverClass}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface pointer-events-none" />

      {/* Mute/Unmute Button */}
      <button
        onClick={handleToggle}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-8 end-8 z-20 h-11 w-11 rounded-full glass flex items-center justify-center text-on-surface hover:text-primary transition-all duration-300 hover:scale-110"
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