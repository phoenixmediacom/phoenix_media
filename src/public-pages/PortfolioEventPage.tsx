import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "../i18n";
import { useAsync } from "../hooks/useAsync";
import { getPortfolioBySlug } from "../services/endpoints/portfolio";
import { LoadingState, ErrorState } from "../components/ui/AsyncStates";
import { BehindTheScenesBadge } from "../components/ui/Card";
import { Nav } from "../components/layout/Nav";
import { Lightbox } from "./sections/Lightbox";
import type { GalleryItem, PortfolioSection as SectionData } from "../services/types";

export default function PortfolioEventPage() {
  const { slug = "" } = useParams();
  const { t } = useI18n();
  const { data: event, loading, error, refetch } = useAsync(() => getPortfolioBySlug(slug), [slug]);
  const [lightbox, setLightbox] = useState<{ items: GalleryItem[]; index: number } | null>(null);

  return (
    <div className="min-h-screen bg-surface">
      <Nav />

      {loading && (
        <div className="pt-32">
          <LoadingState />
        </div>
      )}
      {error && (
        <div className="pt-32">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {event && (
        <>
          <div className="pt-28 pb-8 max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
            <Link
              to="/#portfolio"
              className="font-mono-label text-label-sm uppercase text-on-surface-variant hover:text-primary transition-colors"
            >
              ← {t.portfolio.back}
            </Link>
          </div>

          <header className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {event.behindTheScenes && <BehindTheScenesBadge label={t.portfolio.bts} />}
              {event.companyLogoUrl && (
                <img src={event.companyLogoUrl} alt="" className="h-8 object-contain" />
              )}
              {event.clientLogoUrl && (
                <img src={event.clientLogoUrl} alt="" className="h-8 object-contain rounded" />
              )}
            </div>
            <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-surface">
              {event.title}
            </h1>
          </header>

          <div className="flex flex-col gap-20 md:gap-32 pb-24">
            {[...event.sections]
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  onOpenLightbox={(items, index) => setLightbox({ items, index })}
                />
              ))}
          </div>
        </>
      )}

      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ ...lightbox, index })}
        />
      )}
    </div>
  );
}

function CinematicHeroVideo({
  videoUrl,
  posterUrl,
  showPlayButton,
}: {
  videoUrl: string;
  posterUrl: string;
  showPlayButton: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="relative w-full h-[70vh] md:h-screen overflow-hidden bg-surface-container-lowest">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        muted={muted}
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        onClick={togglePlay}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      {showPlayButton && (
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="absolute inset-0 m-auto h-20 w-20 md:h-24 md:w-24 rounded-full glass flex items-center justify-center text-white transition-transform hover:scale-110"
        >
          {playing ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7Z" />
            </svg>
          )}
        </button>
      )}

      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute bottom-8 end-8 h-11 w-11 rounded-full glass flex items-center justify-center text-white"
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
            <path d="m16 9 5 6M21 9l-5 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
            <path d="M16 8a5 5 0 0 1 0 8M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

function SectionRenderer({
  section,
  onOpenLightbox,
}: {
  section: SectionData;
  onOpenLightbox: (items: GalleryItem[], index: number) => void;
}) {
  const container = "max-w-content mx-auto px-margin-mobile md:px-margin-desktop w-full";

  if (section.type === "hero-video") {
    return (
      <CinematicHeroVideo
        videoUrl={section.videoUrl}
        posterUrl={section.posterUrl}
        showPlayButton={section.showPlayButton}
      />
    );
  }

  if (section.type === "text") {
    return (
      <div className={container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-headline-md text-on-surface mb-4">
            {section.heading}
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant whitespace-pre-line">
            {section.body}
          </p>
        </motion.div>
      </div>
    );
  }

  if (section.type === "gallery") {
    return (
      <div className={container}>
        <div
          className={
            section.layout === "masonry"
              ? "columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5"
              : "grid grid-cols-1 sm:grid-cols-2 gap-5"
          }
        >
          {section.items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.06 }}
              onClick={() => onOpenLightbox(section.items, i)}
              className="group relative block w-full rounded-xl overflow-hidden glass break-inside-avoid"
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.caption ?? ""}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <video src={item.url} muted className="w-full h-auto object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                {item.caption && (
                  <span className="text-white text-sm font-medium">{item.caption}</span>
                )}
                {item.type === "video" && !item.caption && (
                  <span className="text-white text-2xl">▶</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "people") {
    return (
      <div className="relative">
        <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden mb-12">
          <img src={section.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-black/20" />
        </div>
        <div className={container}>
          <div className="flex flex-wrap gap-10 justify-center">
            {[...section.people]
              .sort((a, b) => a.order - b.order)
              .map((person) => (
                <motion.button
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => onOpenLightbox(person.gallery, 0)}
                  disabled={person.gallery.length === 0}
                  className="flex flex-col items-center gap-3 group disabled:cursor-default"
                >
                  <span className="h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary group-hover:shadow-bloom transition-all duration-500">
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="text-base font-medium text-on-surface group-hover:text-primary transition-colors">
                    {person.name}
                  </span>
                </motion.button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
