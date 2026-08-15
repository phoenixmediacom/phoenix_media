import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryItem } from "../../services/types";

interface LightboxProps {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

// 🔧 دوال مساعدة
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? match[1] : '';
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
}

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const item = items[index];
  const [videoStarted, setVideoStarted] = useState(false); // ✅ للتحكم بتحميل الفيديو

  useEffect(() => {
    // Reset عند تغيير العنصر
    setVideoStarted(false);
    
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (item.type === "image") {
        if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
        if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, item, onClose, onNavigate]);

  if (!item) return null;

  const isYouTube = item.type === "video" && isYouTubeUrl(item.url);
  const isVimeo = item.type === "video" && isVimeoUrl(item.url);
  const isDirectVideo = item.type === "video" && !isYouTube && !isVimeo;

  const showNavigation = item.type === "image" && items.length > 1;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 end-6 h-12 w-12 rounded-full bg-white/10 hover:bg-primary backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-black transition-all duration-300 hover:scale-110 z-10 text-xl font-bold"
        >
          ✕
        </button>

        {/* أزرار التنقل - فقط للصور */}
        {showNavigation && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((index - 1 + items.length) % items.length);
              }}
              aria-label="Previous"
              className="absolute start-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-primary backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-black transition-all duration-300 hover:scale-110 z-10 text-2xl"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((index + 1) % items.length);
              }}
              aria-label="Next"
              className="absolute end-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-primary backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-black transition-all duration-300 hover:scale-110 z-10 text-2xl"
            >
              ›
            </button>
          </>
        )}

        {/* المحتوى الرئيسي */}
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-6xl max-h-[85vh] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* 🖼️ صورة */}
            {item.type === "image" && (
              <img
                src={item.url}
                alt={item.caption ?? ""}
                className="w-full h-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            )}

            {/* 🎥 فيديو YouTube */}
            {isYouTube && (
              <div className="relative w-full aspect-video max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
                {!videoStarted ? (
                  // ✅ عرض thumbnail قبل التشغيل
                  <div 
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setVideoStarted(true)}
                  >
                    <img
                      src={getYouTubeThumbnail(item.url)}
                      alt={item.caption ?? "Video"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                        <svg className="w-10 h-10 md:w-12 md:h-12 fill-current text-black translate-x-1" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  // ✅ تحميل iframe فقط عند الضغط
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(item.url)}?autoplay=1&rel=0`}
                    title={item.caption || "YouTube Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>
            )}

            {/* 🎥 فيديو Vimeo */}
            {isVimeo && (
              <div className="relative w-full aspect-video max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
                {!videoStarted ? (
                  <div 
                    className="relative w-full h-full cursor-pointer group bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center"
                    onClick={() => setVideoStarted(true)}
                  >
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 md:w-12 md:h-12 fill-current text-black translate-x-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7Z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`https://player.vimeo.com/video/${extractVimeoId(item.url)}?autoplay=1`}
                    title={item.caption || "Vimeo Video"}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>
            )}

            {/* 🎥 فيديو مباشر */}
            {isDirectVideo && (
              <div className="relative w-full max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src={item.url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[75vh] object-contain bg-black"
                />
              </div>
            )}

            {/* العنوان التوضيحي */}
            {item.caption && (
              <p className="text-center text-white text-base md:text-lg mt-6 px-4 drop-shadow-lg">
                {item.caption}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}