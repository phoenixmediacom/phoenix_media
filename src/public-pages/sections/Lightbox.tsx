import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryItem } from "../../services/types";

interface LightboxProps {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const item = items[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

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
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 end-6 h-10 w-10 rounded-full glass flex items-center justify-center text-white z-10"
        >
          ✕
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index - 1 + items.length) % items.length);
          }}
          aria-label="Previous"
          className="absolute start-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass flex items-center justify-center text-white z-10"
        >
          ‹
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index + 1) % items.length);
          }}
          aria-label="Next"
          className="absolute end-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass flex items-center justify-center text-white z-10"
        >
          ›
        </button>

        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-5xl max-h-[85vh] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={item.caption ?? ""}
              className="w-full h-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />
          ) : (
            <video
              src={item.url}
              controls
              autoPlay
              className="w-full h-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />
          )}
          {item.caption && (
            <p className="text-center text-on-surface-variant mt-4">{item.caption}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
