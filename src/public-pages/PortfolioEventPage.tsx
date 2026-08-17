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
import type { GalleryItem } from "../services/types";

// 🔧 دوال مساعدة لمعالجة روابط الفيديو
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? match[1] : '';
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

// ✅ دالة لتحديد نوع الميديا بناءً على الرابط
function detectMediaType(url: string): "image" | "video" {
  if (isYouTubeUrl(url) || isVimeoUrl(url) || url.includes('.mp4') || url.includes('.webm')) {
    return "video";
  }
  return "image";
}

export default function PortfolioEventPage() {
  const { slug = "" } = useParams();
  const { t, locale } = useI18n();
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
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
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

          {/* ترويسة الفعالية */}
          <header className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-14 pt-4 text-center flex flex-col items-center">
            {event.behind_the_scenes && (
              <div className="mb-6">
                <BehindTheScenesBadge label={t.portfolio.bts} />
              </div>
            )}
          
            <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight leading-tight max-w-4xl mx-auto mb-10">
              {event.title?.[locale] || event.title?.en || ""}
            </h1>
          
            {(event.company_logo_url || event.client_logo_url) && (
              <div className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-10 p-4 md:p-6 rounded-3xl glass bg-white/5 border border-white/15 backdrop-blur-2xl shadow-2xl transition-all hover:border-primary/30">
                {event.company_logo_url && (
                  <div className="group relative flex items-center justify-center h-16 md:h-24 px-6 md:px-8 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner transition-all duration-300 hover:scale-105 hover:bg-white/15">
                    <img
                      src={event.company_logo_url}
                      alt="Company Logo"
                      className="h-full w-auto max-w-[160px] md:max-w-[220px] object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              
                {event.company_logo_url && event.client_logo_url && (
                  <div className="hidden sm:block w-px h-10 md:h-14 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                )}
              
                {event.client_logo_url && (
                  <div className="group relative flex items-center justify-center h-16 md:h-24 px-6 md:px-8 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner transition-all duration-300 hover:scale-105 hover:bg-white/15">
                    <img
                      src={event.client_logo_url}
                      alt="Client Logo"
                      className="h-full w-auto max-w-[160px] md:max-w-[220px] object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </div>
            )}
          </header>

          {/* أقسام الفعالية */}
          <div className="flex flex-col gap-16 md:gap-28 pb-24">
            {[...(event.sections || [])]
              .sort((a: any, b: any) => a.order - b.order)
              .map((section: any) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  locale={locale}
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
  const [showPoster, setShowPoster] = useState(true);

  const isYouTube = isYouTubeUrl(videoUrl);
  const isVimeo = isVimeoUrl(videoUrl);
  const isDirectVideo = !isYouTube && !isVimeo;

  function togglePlay() {
    if (isDirectVideo) {
      const v = videoRef.current;
      if (!v) return;
      
      if (v.paused) {
        v.play();
        setPlaying(true);
        setShowPoster(false);
      } else {
        v.pause();
        setPlaying(false);
      }
    }
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] max-w-[1400px] mx-auto overflow-hidden md:rounded-3xl glass border border-white/10 shadow-2xl bg-surface-container-lowest">
      
      {isDirectVideo && (
        <>
          {showPoster && posterUrl && (
            <div className="absolute inset-0 z-20">
              <img 
                src={posterUrl} 
                alt="Video Poster" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            </div>
          )}

          <video
            ref={videoRef}
            src={videoUrl}
            muted={muted}
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            onPlay={() => {
              setPlaying(true);
              setShowPoster(false);
            }}
            onPause={() => setPlaying(false)}
          />

          {showPlayButton && (
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="absolute inset-0 m-auto h-20 w-20 md:h-24 md:w-24 rounded-full bg-white/10 hover:bg-primary backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:text-black transition-all duration-400 hover:scale-110 shadow-2xl z-30"
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

          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="absolute bottom-6 end-6 md:bottom-8 md:end-8 h-12 w-12 rounded-full bg-black/40 hover:bg-primary backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-black transition-all duration-300 hover:scale-105 shadow-lg z-30"
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
        </>
      )}

      {isYouTube && (
        <div className="absolute inset-0">
          {posterUrl && !playing && (
            <div className="absolute inset-0 z-20">
              <img 
                src={posterUrl} 
                alt="Video Poster" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}?autoplay=0&controls=1`}
            title="Hero Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onLoad={() => setPlaying(true)}
          />
        </div>
      )}

      {isVimeo && (
        <div className="absolute inset-0">
          {posterUrl && !playing && (
            <div className="absolute inset-0 z-20">
              <img 
                src={posterUrl} 
                alt="Video Poster" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            </div>
          )}
          <iframe
            src={`https://player.vimeo.com/video/${videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]}?autoplay=0`}
            title="Hero Video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onLoad={() => setPlaying(true)}
          />
        </div>
      )}
    </div>
  );
}

function SectionRenderer({
  section,
  locale,
  onOpenLightbox,
}: {
  section: any;
  locale: "ar" | "en";
  onOpenLightbox: (items: GalleryItem[], index: number) => void;
}) {
  const container = "max-w-content mx-auto px-margin-mobile md:px-margin-desktop w-full";

  if (section.type === "hero-video") {
    const videoUrl = section.data?.videoUrl || "";
    const posterUrl = section.data?.posterUrl || "";
    const showPlayButton = section.data?.showPlayButton ?? true;
    
    return (
      <CinematicHeroVideo
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        showPlayButton={showPlayButton}
      />
    );
  }

  if (section.type === "text") {
    const heading = section.data?.heading?.[locale] || section.data?.heading?.en || section.data?.heading?.ar || '';
    const body = section.data?.body?.[locale] || section.data?.body?.en || section.data?.body?.ar || '';

    if (!heading && !body) {
      return null;
    }

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
          {heading && (
            <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4 tracking-tight">
              {heading}
            </h2>
          )}
          {body && (
            <p className="font-body text-body-lg text-on-surface-variant/90 leading-relaxed whitespace-pre-line">
              {body}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  if (section.type === "gallery") {
    const layout = section.data?.layout || "grid";
    
    // ✅ قراءة من section.media مباشرة مع تصحيح النوع
    const items: GalleryItem[] = (section.media || []).map((m: any) => ({
      id: String(m.id),
      type: detectMediaType(m.url), // ✅ استخدام الدالة الذكية
      url: m.url || "",
      caption: m.caption?.[locale] || m.caption?.en || m.caption || undefined,
    }));
    
    if (items.length === 0) {
      return null;
    }

    return (
      <div className={container}>
        <div
          className={
            layout === "masonry"
              ? "columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6"
              : "grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8"
          }
        >
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (i % 6) * 0.06 }}
              onClick={() => onOpenLightbox(items, i)}
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
                <div className="relative w-full aspect-video bg-black">
                  {isYouTubeUrl(item.url) ? (
                    <img
                      src={`https://img.youtube.com/vi/${extractYouTubeId(item.url)}/maxresdefault.jpg`}
                      alt={item.caption ?? "Video"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                      <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="h-16 w-16 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 fill-current translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7Z" />
                      </svg>
                    </span>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                {item.caption && (
                  <span className="text-white text-sm md:text-base font-medium drop-shadow-md">{item.caption}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "people") {
    const heroImageUrl = section.data?.heroImageUrl || "";
    
    // ✅ الحل الصحيح: استخدام person.gallery مباشرة من الـ API!
    const people = (section.people || []).map((p: any) => ({
      id: String(p.id),
      name: p.name || "",
      photoUrl: p.image_url || "",
      order: p.order || 0,
      gallery: (p.gallery || []).map((m: any) => ({
        id: String(m.id),
        type: detectMediaType(m.url), // ✅ تصحيح النوع
        url: m.url || "",
        caption: m.caption?.[locale] || m.caption?.en || m.caption || undefined,
      })),
    }));
    
    if (people.length === 0) {
      return null;
    }

    return (
      <div className="relative">
        {heroImageUrl && (
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={heroImageUrl} 
              alt="Team Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/95 via-surface/85 to-surface/95 backdrop-blur-sm" />
          </div>
        )}

        <div className="relative z-10 py-20 md:py-32">
          <div className={container}>
            <div className="flex flex-wrap gap-8 md:gap-12 justify-center">
              {people
                .sort((a: any, b: any) => a.order - b.order)
                .map((person: any) => {
                  const gallery = Array.isArray(person.gallery) ? person.gallery : [];
                  
                  return (
                    <motion.button
                      key={person.id}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5 }}
                      onClick={() => gallery.length > 0 && onOpenLightbox(gallery, 0)}
                      disabled={gallery.length === 0}
                      className="flex flex-col items-center gap-3.5 group disabled:cursor-default disabled:opacity-60"
                    >
                      <span className="h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden p-1 bg-white/5 border-2 border-white/20 group-hover:border-primary group-hover:shadow-bloom transition-all duration-500 relative">
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="h-full w-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="text-base md:text-lg font-medium text-on-surface group-hover:text-primary transition-colors drop-shadow-lg">
                        {person.name}
                      </span>
                    </motion.button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}