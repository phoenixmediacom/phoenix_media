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
    <div className="min-h-screen bg-surface text-on-surface">
      <Nav />

      {loading && (
        <div className="pt-36 pb-20">
          <LoadingState />
        </div>
      )}
      {error && (
        <div className="pt-36 pb-20">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {event && (
        <>
          {/* زر الرجوع والتصفح */}
          <div className="pt-28 pb-6 max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
            <Link
              to="/#portfolio"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-white/10 hover:border-primary/40 text-xs font-mono-label uppercase text-on-surface-variant hover:text-primary transition-all duration-300 hover:scale-105 shadow-sm"
            >
              <svg
                className="w-4 h-4 rtl:rotate-180 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>{t.portfolio.back}</span>
            </Link>
          </div>

          {/* ترويسة الفعالية وشعارات الشركاء والعملاء */}
          <header className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-12 pt-2">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {event.behindTheScenes && <BehindTheScenesBadge label={t.portfolio.bts} />}
              
              {event.companyLogoUrl && (
                <div className="px-3.5 py-1.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm flex items-center">
                  <img src={event.companyLogoUrl} alt="Company Logo" className="h-6 md:h-7 object-contain" />
                </div>
              )}
              
              {event.clientLogoUrl && (
                <div className="px-3.5 py-1.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm flex items-center">
                  <img src={event.clientLogoUrl} alt="Client Logo" className="h-6 md:h-7 object-contain rounded" />
                </div>
              )}
            </div>

            <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight leading-tight max-w-4xl">
              {event.title}
            </h1>
          </header>

          {/* أقسام الفعالية */}
          <div className="flex flex-col gap-16 md:gap-28 pb-24">
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

      {/* النافذة المنبثقة للوسائط */}
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

// مكون الفيديو السينمائي الفاخر
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
    <div className="relative w-full h-[70vh] md:h-[85vh] max-w-[1400px] mx-auto overflow-hidden md:rounded-3xl glass border border-white/10 shadow-2xl bg-surface-container-lowest">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        muted={muted}
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover cursor-pointer"
        onClick={togglePlay}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* زر التشغيل والإيقاف المركز */}
      {showPlayButton && (
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="absolute inset-0 m-auto h-20 w-20 md:h-24 md:w-24 rounded-full bg-white/10 hover:bg-primary backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:text-black transition-all duration-400 hover:scale-110 shadow-2xl group"
        >
          {playing ? (
            <svg className="w-8 h-8 md:w-9 md:h-9 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1.5" />
              <rect x="14" y="5" width="4" height="14" rx="1.5" />
            </svg>
          ) : (
            <svg className="w-8 h-8 md:w-9 md:h-9 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7Z" />
            </svg>
          )}
        </button>
      )}

      {/* زر كتم الصوت */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute bottom-6 end-6 md:bottom-8 md:end-8 h-12 w-12 rounded-full bg-black/40 hover:bg-primary backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-black transition-all duration-300 hover:scale-105 shadow-lg"
      >
        {muted ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
            <path d="m16 9 5 6M21 9l-5 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
            <path d="M16 8a5 5 0 0 1 0 8M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

// محرك عرض الأقسام الاحترافي
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
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden"
        >
          <div className="w-12 h-1 bg-primary rounded-full mb-6" />
          <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4 tracking-tight">
            {section.heading}
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant/90 leading-relaxed whitespace-pre-line">
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
              ? "columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6"
              : "grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8"
          }
        >
          {section.items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (i % 6) * 0.06 }}
              onClick={() => onOpenLightbox(section.items, i)}
              className="group relative block w-full rounded-2xl md:rounded-3xl overflow-hidden glass border border-white/10 hover:border-primary/40 break-inside-avoid transition-all duration-500 hover:shadow-xl"
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
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                {item.caption && (
                  <span className="text-white text-sm md:text-base font-medium drop-shadow-md">{item.caption}</span>
                )}
                {item.type === "video" && (
                  <span className="h-12 w-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7Z" />
                    </svg>
                  </span>
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
        <div className="relative w-full max-w-[1400px] mx-auto h-[50vh] md:h-[65vh] md:rounded-3xl overflow-hidden mb-12 glass border border-white/10 shadow-2xl">
          <img src={section.heroImageUrl} alt="Team/People Hero" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>

        <div className={container}>
          <div className="flex flex-wrap gap-8 md:gap-12 justify-center">
            {[...section.people]
              .sort((a, b) => a.order - b.order)
              .map((person) => (
                <motion.button
                  key={person.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => onOpenLightbox(person.gallery, 0)}
                  disabled={person.gallery.length === 0}
                  className="flex flex-col items-center gap-3.5 group disabled:cursor-default"
                >
                  <span className="h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden p-1 bg-white/5 border border-white/10 group-hover:border-primary group-hover:shadow-bloom transition-all duration-500 relative">
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="h-full w-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="text-base md:text-lg font-medium text-on-surface group-hover:text-primary transition-colors">
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