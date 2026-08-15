import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getPublicPortfolio } from "../../services/endpoints/portfolio";
import { Section } from "../../components/layout/Section";
import { BehindTheScenesBadge } from "../../components/ui/Card";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import type { PortfolioEvent } from "../../services/types";

function EventTile({
  event,
  featured,
  index,
}: {
  event: PortfolioEvent;
  featured?: boolean;
  index: number;
}) {
  const { t, locale } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className={`h-full ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <Link
        to={`/portfolio/${event.slug}`}
        className={`group relative flex flex-col justify-end w-full h-full rounded-2xl overflow-hidden glass transition-all duration-500 hover:shadow-xl ${
          featured
            ? "min-h-[380px] md:min-h-[520px] aspect-[4/3] md:aspect-auto"
            : "min-h-[320px] md:min-h-[380px] aspect-[4/5]"
        }`}
      >
        <img
          src={event.cover_image_url} // 👈 استخدام cover_image_url
          alt={event.title[locale]}  // 👈 استخراج النص حسب اللغة الحالية
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {event.behind_the_scenes && ( // 👈 استخدام behind_the_scenes
          <div className="absolute top-4 start-4 z-10">
            <BehindTheScenesBadge label={t.portfolio.bts} />
          </div>
        )}

        <span className="absolute top-4 end-4 z-10 h-10 w-10 md:h-12 md:w-12 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end">
          <h3
            className={`font-display font-bold text-white drop-shadow-md transition-transform duration-300 group-hover:-translate-y-1 ${
              featured ? "text-2xl md:text-3xl lg:text-4xl" : "text-lg md:text-xl"
            }`}
          >
            {event.title[locale]} {/* 👈 استخراج العنوان حسب اللغة الحالية */}
          </h3>
          <span className="font-mono-label text-label-sm text-primary uppercase mt-3 inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            {t.portfolio.viewProject}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function PortfolioSection() {
  const { t } = useI18n();
  const { data: events, loading, error, refetch } = useAsync(() => getPublicPortfolio(), []);

  return (
    <Section id="portfolio" className="bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="font-display text-headline-lg text-on-surface">{t.portfolio.title}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-3 max-w-2xl mx-auto">
          {t.portfolio.subtitle}
        </p>
      </motion.div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {events && events.length === 0 && (
        <p className="text-center text-on-surface-variant py-12">{t.portfolio.empty}</p>
      )}

      {events && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {events.map((event, index) => (
            <EventTile key={event.id} event={event} featured={index === 0} index={index} />
          ))}
        </div>
      )}
    </Section>
  );
}