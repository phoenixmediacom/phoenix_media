import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getHero } from "../../services/endpoints/hero";
import { useHeroProgress } from "../../components/layout/HeroProgressContext";
import { VideoBackground } from "./VideoBackground";
import { SocialIcons } from "../../components/layout/SocialIcons";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

export function HeroSection() {
  const { t } = useI18n();
  const { data: hero, loading, error, refetch } = useAsync(() => getHero(), []);
  const [muted, setMuted] = useState(true);
  const progress = useHeroProgress();

  return (
    <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {hero && (
        <div className="absolute inset-0 z-0">
          <VideoBackground
            source={hero.video}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        </div>
      )}

      {/* طبقة تغميق اختيارية فوق الفيديو لتحسين وضوح النص */}
      <div className="absolute inset-0 z-[1] bg-black/30" >
        <div className="relative z-10 text-center px-margin-mobile">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={refetch} />}
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
                className="h-20 md:h-28 w-auto mx-auto mb-6 object-contain"
              />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
                className="font-display text-display-lg-mobile md:text-display-lg text-on-surface"
              >
                {hero.companyName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="font-mono-label uppercase text-label-sm text-primary mt-4 tracking-widest"
              >
                {hero.tagline || t.hero.tagline}
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
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-on-surface-variant"
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
