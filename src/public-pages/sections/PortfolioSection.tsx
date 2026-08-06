import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listPortfolio } from "../../services/endpoints/portfolio";
import { Section } from "../../components/layout/Section";
import { BehindTheScenesBadge } from "../../components/ui/Card";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import type { PortfolioEvent } from "../../services/types";

// مكون الفرعي للبطاقة برؤية هندسية وتصميم احترافي
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
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`h-full ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <Link
        to={`/portfolio/${event.slug}`}
        className={`group relative flex flex-col justify-between w-full h-full rounded-3xl overflow-hidden glass border border-white/10 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${
          featured
            ? "min-h-[420px] md:min-h-[560px] aspect-[4/3] md:aspect-auto"
            : "min-h-[340px] md:min-h-[400px] aspect-[4/5]"
        }`}
      >
        {/* خلفية الصورة مع تأثير التكبير النقي */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            loading="lazy"
          />
          {/* متدرج لوني احترافي يضمن وضوح النصوص والقوائم */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
        </div>

        {/* الشريط العلوي: الشارات وشعار العميل */}
        <div className="relative z-10 p-5 md:p-6 flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {event.behindTheScenes && (
              <BehindTheScenesBadge label={t.portfolio.bts} />
            )}
            
            {/* عرض العميل / الفعالية كبسولة زجاجية ملفتة */}
            {(event as any).clientName && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90 shadow-sm">
                {(event as any).clientLogoUrl && (
                  <img
                    src={(event as any).clientLogoUrl}
                    alt={(event as any).clientName}
                    className="w-4 h-4 object-contain"
                  />
                )}
                {(event as any).clientName}
              </span>
            )}
          </div>

          {/* زر الأيقونة الرئيسي - تم تكبيره وحركته التفاعلية */}
          <span className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-primary backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-90 md:opacity-0 group-hover:opacity-100 transition-all duration-400 group-hover:scale-105 group-hover:rotate-12 shadow-xl shrink-0">
            <svg
              className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
            </svg>
          </span>
        </div>

        {/* الشريط السفلي: العنوان وزر التفاصيل */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end">
          <h3
            className={`font-display font-bold text-white drop-shadow-md transition-transform duration-400 group-hover:-translate-y-1.5 ${
              featured ? "text-2xl md:text-3xl lg:text-4xl leading-tight" : "text-xl md:text-2xl"
            }`}
          >
            {event.title}
          </h3>

          {/* رابط استكشاف المشروع بأيقونة واضحة وقابلة للتفاعل */}
          <div className="mt-4 inline-flex items-center gap-2.5 text-primary font-mono-label text-sm font-semibold uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-all duration-300">
            <span>{t.portfolio.viewProject}</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-300 transform group-hover:translate-x-1">
              <svg
                className="w-3.5 h-3.5 rtl:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PortfolioSection() {
  const { t } = useI18n();
  const { data: events, loading, error, refetch } = useAsync(() => listPortfolio(true), []);

  return (
    <Section id="portfolio" className="bg-surface relative overflow-hidden">
      {/* خلفية جمالية خفيفة لتعزيز الطابع العصري */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
        >
          <h2 className="font-display text-headline-lg text-on-surface tracking-tight">
            {t.portfolio.title}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-4 leading-relaxed">
            {t.portfolio.subtitle}
          </p>
        </motion.div>

        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {events && events.length === 0 && (
          <p className="text-center text-on-surface-variant py-16 text-lg">{t.portfolio.empty}</p>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
            {events.map((event, index) => (
              <EventTile key={event.id} event={event} featured={index === 0} index={index} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}