import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listClients } from "../../services/endpoints/clients";
import { Section } from "../../components/layout/Section";
import { LogoLoop, type LogoItem as LoopLogoItem } from "../../components/ui/LogoLoop";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

export function ClientsSection() {
  const { t } = useI18n();
  const { data: clients, loading, error, refetch } = useAsync(() => listClients(), []);

  const loopLogos: LoopLogoItem[] =
    clients?.map((c) => ({ src: c.logoUrl, alt: c.name, title: c.name })) ?? [];

  return (
    <Section id="clients" className="bg-surface-container-lowest">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-headline-lg text-on-surface">{t.clients.title}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-3">{t.clients.subtitle}</p>
      </motion.div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {clients && clients.length > 0 && (
        <div style={{ height: 220 }}>
          <LogoLoop
            logos={loopLogos}
            speed={90}
            direction="left"
            logoHeight={56}
            gap={64}
            fadeOut
            fadeOutColor="#0e0e10"
            scaleOnHover
            ariaLabel={t.clients.title}
          />
        </div>
      )}
    </Section>
  );
}
