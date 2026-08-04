import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { listEquipment } from "../../services/endpoints/equipment";
import { Section } from "../../components/layout/Section";
import { LogoLoop, type LogoItem as LoopLogoItem } from "../../components/ui/LogoLoop";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

export function EquipmentSection() {
  const { t } = useI18n();
  const { data: equipment, loading, error, refetch } = useAsync(() => listEquipment(), []);

  const loopLogos: LoopLogoItem[] =
    equipment?.map((e) => ({ src: e.logoUrl, alt: e.name, title: e.name })) ?? [];

  return (
    <Section id="equipment" className="bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-headline-lg text-on-surface">{t.equipment.title}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-3">
          {t.equipment.subtitle}
        </p>
      </motion.div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {equipment && equipment.length > 0 && (
        <div style={{ height: 180 }}>
          <LogoLoop
            logos={loopLogos}
            speed={70}
            direction="right"
            logoHeight={48}
            gap={56}
            fadeOut
            fadeOutColor="#131315"
            scaleOnHover
            ariaLabel={t.equipment.title}
          />
        </div>
      )}
    </Section>
  );
}
