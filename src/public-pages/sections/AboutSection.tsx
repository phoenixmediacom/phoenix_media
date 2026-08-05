import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getAbout } from "../../services/endpoints/about";
import { Section } from "../../components/layout/Section";
import { Eyebrow } from "../../components/ui/Card";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import { AnimatedBackground } from "./AnimatedBackground";

export function AboutSection() {
  const { t, locale } = useI18n();
  const { data: about, loading, error, refetch } = useAsync(() => getAbout(), []);

  return (
    <Section
      id="about"
      className="relative isolate overflow-hidden min-h-[100svh] bg-surface"
    >
      {about && <AnimatedBackground variant={about.backgroundVariant} />}

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {about && (
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
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
    </Section>
  );
}