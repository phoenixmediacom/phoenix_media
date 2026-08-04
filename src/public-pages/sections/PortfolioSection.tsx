import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listPortfolio } from "../../services/endpoints/portfolio";
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
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: "easeOut" }}
      className={featured ? "md:col-span-2 md:row-span-2" : ""}
    >
      <Link
        to={`/portfolio/${event.slug}`}
        className={`group relative block rounded-xl overflow-hidden glass ${
          featured ? "aspect-[16/11] md:aspect-square" : "aspect-[4/5]"
        }`}
      >
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

        {event.behindTheScenes && (
          <div className="absolute top-5 start-5">
            <BehindTheScenesBadge label={t.portfolio.bts} />
          </div>
        )}

        <span className="absolute top-5 end-5 h-12 w-12 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
          <h3
            className={`font-display font-bold text-white drop-shadow-lg transition-transform duration-500 group-hover:-translate-y-1 ${
              featured ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"
            }`}
          >
            {event.title}
          </h3>
          <span className="font-mono-label text-label-sm text-primary uppercase mt-3 inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
  const { data: events, loading, error, refetch } = useAsync(() => listPortfolio(true), []);

  return (
    <Section id="portfolio" className="bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-headline-lg text-on-surface">{t.portfolio.title}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-3">
          {t.portfolio.subtitle}
        </p>
      </motion.div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {events && events.length === 0 && (
        <p className="text-center text-on-surface-variant">{t.portfolio.empty}</p>
      )}

      {events && events.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(0,1fr)] gap-6">
          {events.map((event, index) => (
            <EventTile key={event.id} event={event} featured={index === 0} index={index} />
          ))}
        </div>
      )}
    </Section>
  );
}
