import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getPublicServices } from "../../services/endpoints/services";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/Card";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import type { ServiceIcon } from "../../services/types";

function ServiceIconView({ icon }: { icon: ServiceIcon }) {
  if (icon.type === "image") {
    return <img src={icon.value} alt="" className="h-10 w-10 object-contain mb-4" />;
  }
  if (icon.type === "fontawesome") {
    return (
      <i className={`${icon.value} text-4xl text-primary mb-4`} aria-hidden="true" />
    );
  }
  return (
    <span className="text-4xl mb-4 block" aria-hidden="true">
      {icon.value}
    </span>
  );
}

export function ServicesSection() {
  const { t, locale } = useI18n();
  const { data: services, loading, error, refetch } = useAsync(() => getPublicServices(), []);

  return (
    <Section id="services" className="bg-surface-container-lowest">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-headline-lg text-on-surface">{t.services.title}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-3">
          {t.services.subtitle}
        </p>
      </motion.div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {services && services.length === 0 && (
        <p className="text-center text-on-surface-variant">{t.services.empty}</p>
      )}

      {services && services.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Card className="h-full flex flex-col">
                <ServiceIconView icon={service.icon} />
                <h3 className="font-display text-xl font-bold text-on-surface mb-2">
                  {service.title[locale]}
                </h3>
                <p className="font-body text-body-md text-on-surface-variant">
                  {service.description[locale]}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}
