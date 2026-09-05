import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getAbout } from "../../services/endpoints/about";
import { Eyebrow } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/AsyncStates";
import { LoaderSkeleton } from "../../components/ui/loaders-skeleton";
import { AnimatedBackground } from "./AnimatedBackground";

export function AboutSection() {
  const { t, locale } = useI18n();
  const { data: about, loading, error, refetch } = useAsync(() => getAbout(), []);

  return (
    <section
      id="about"
      className="relative isolate overflow-hidden min-h-[100svh] w-full bg-surface py-24"
    >
      {about && <AnimatedBackground variant={about.backgroundVariant} />}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
        {error && <ErrorState message={error} onRetry={refetch} />}

        {loading && !about && (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <LoaderSkeleton width={120} height={14} className="mb-5" />
              <LoaderSkeleton width="85%" height={32} className="mb-6" />
              <LoaderSkeleton height={16} className="mb-3" />
              <LoaderSkeleton height={16} className="mb-3" />
              <LoaderSkeleton width="70%" height={16} />
            </div>
            <LoaderSkeleton height={420} borderRadius={16} />
          </div>
        )}

        {about && (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Eyebrow>{t.about.eyebrow}</Eyebrow>
              <h2 className="font-display text-headline-lg text-on-surface mb-6">
                {about.title[locale]}
              </h2>
              <p className="font-body text-body-lg text-on-surface-variant whitespace-pre-line">
                {about.description[locale]}
              </p>
            </motion.div>

            {about.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="rounded-xl overflow-hidden glass"
              >
                <img
                  src={about.imageUrl}
                  alt={about.title[locale]}
                  className="w-full h-[420px] object-cover"
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}