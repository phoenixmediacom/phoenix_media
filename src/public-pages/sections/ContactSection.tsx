import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getContactInfo, submitContactForm } from "../../services/endpoints/contact";
import { Section } from "../../components/layout/Section";
import { Field, Input, Textarea } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/AsyncStates";
import { SocialIcons } from "../../components/layout/SocialIcons";

export function ContactSection() {
  const { t } = useI18n();
  const { data: info, loading } = useAsync(() => getContactInfo(), []);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContactForm(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section id="contact" className="bg-surface-container-lowest">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-headline-lg text-on-surface">{t.contact.title}</h2>
        <p className="font-body text-body-md text-on-surface-variant mt-3">{t.contact.subtitle}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10">
        <form onSubmit={onSubmit} className="flex flex-col gap-5 glass rounded-xl p-6 md:p-8">
          <Field label={t.contact.name} htmlFor="contact-name">
            <Input
              id="contact-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label={t.contact.email} htmlFor="contact-email">
            <Input
              id="contact-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label={t.contact.message} htmlFor="contact-message">
            <Textarea
              id="contact-message"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? t.contact.sending : t.contact.send}
          </Button>
          {status === "sent" && <p className="text-primary text-sm">{t.contact.sent}</p>}
          {status === "error" && <p className="text-error text-sm">{t.contact.error}</p>}
        </form>

        <div className="flex flex-col gap-8">
          {loading && <LoadingState />}
          {info && (
            <div className="glass rounded-xl p-6 md:p-8 flex flex-col gap-4">
              <ContactRow label={t.contact.emailLabel} value={info.email} href={`mailto:${info.email}`} />
              <ContactRow label={t.contact.phoneLabel} value={info.phone} href={`tel:${info.phone}`} />
              {info.address && <ContactRow label={t.contact.addressLabel} value={info.address} />}
              <ContactRow
                label={t.contact.whatsapp}
                value={info.whatsapp}
                href={`https://wa.me/${info.whatsapp.replace(/[^\d]/g, "")}`}
              />
              <SocialIcons className="mt-2" />
            </div>
          )}
          {info?.mapEmbedUrl && (
            <div className="rounded-xl overflow-hidden glass h-64">
              <iframe
                src={info.mapEmbedUrl}
                title="Location map"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="font-mono-label text-label-sm uppercase text-on-surface-variant block">
        {label}
      </span>
      <span className="text-on-surface">{value}</span>
    </>
  );
  return href ? (
    <a href={href} className="hover:text-primary transition-colors">
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}
