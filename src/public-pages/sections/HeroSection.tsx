import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getHero } from "../../services/endpoints/hero";
import { useHeroProgress } from "../../components/layout/HeroProgressContext";
import { VideoBackground } from "./VideoBackground";
import { SocialIcons } from "../../components/layout/SocialIcons";
import { ErrorState } from "../../components/ui/AsyncStates";
import { LoaderSkeleton } from "../../components/ui/loaders-skeleton";

export function HeroSection() {
  const { t, locale } = useI18n();
  const { data: hero, loading, error, refetch } = useAsync(() => getHero(), []);
  const [muted, setMuted] = useState(true);
  const progress = useHeroProgress();

  return (
    <section id="hero" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {hero && (
        <VideoBackground
          source={hero.video}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      )}

      <div className="relative z-10 text-center px-margin-mobile">
        {error && <ErrorState message={error} onRetry={refetch} />}
        {loading && !hero && (
          <div className="flex flex-col items-center">
            <LoaderSkeleton width={112} height={112} borderRadius={9999} className="mb-6" />
            <LoaderSkeleton width={280} height={36} className="mb-4" />
            <LoaderSkeleton width={160} height={16} className="mb-8" />
            <LoaderSkeleton width={140} height={32} borderRadius={9999} />
          </div>
        )}
        {hero && (
          <motion.div
            style={{ opacity: 1 - progress, transform: `translateY(${progress * -24}px)` }}
          >
            <motion.img
              src={hero.logoUrl}
              alt={hero.companyName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-20 md:h-28 w-auto mx-auto mb-6 object-contain drop-shadow-2xl"
            />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
              className="font-display text-display-lg-mobile md:text-display-lg text-white drop-shadow-lg"
            >
              {hero.companyName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="font-mono-label uppercase text-label-sm text-primary mt-4 tracking-widest drop-shadow-md"
            >
              {hero.tagline?.[locale] || t.hero.tagline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-10 flex justify-center"
            >
              <SocialIcons />
            </motion.div>
          </motion.div>
        )}
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/70"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: 1 - progress * 2 }}
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}