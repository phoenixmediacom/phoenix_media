/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ✅ تعريف Window.YT لـ YouTube IFrame API
interface Window {
  YT?: any;
  onYouTubeIframeAPIReady?: () => void;
}

// ✅ تعريف global للوصول إلى Window في Node context
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};