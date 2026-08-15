import { useState } from "react";
import { motion } from "framer-motion";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getContactInfo, submitContactForm } from "../../services/endpoints/contact";
import { Section } from "../../components/layout/Section";
import { Field, Input, Textarea } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/AsyncStates";
import { SocialIcons } from "../../components/layout/SocialIcons";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export function ContactSection() {
  const { t, locale } = useI18n(); // ✅ إضافة locale
  const { data: info, loading } = useAsync(() => getContactInfo(), []);
  
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [honeypot, setHoneypot] = useState({ website: "", url: "" });

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "الاسم يجب أن يكون حرفين على الأقل";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "الاسم طويل جداً";
    }

    if (!form.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "البريد الإلكتروني غير صحيح";
      }
    }

    if (!form.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!isValidPhoneNumber(form.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح";
    }

    if (!form.message.trim()) {
      newErrors.message = "الرسالة مطلوبة";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "الرسالة يجب أن تكون 10 أحرف على الأقل";
    } else if (form.message.trim().length > 5000) {
      newErrors.message = "الرسالة طويلة جداً (الحد الأقصى 5000 حرف)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setErrors({});
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setStatus("sending");

    try {
      await submitContactForm({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        message: form.message.trim(),
        ...honeypot,
      });

      setStatus("sent");
      
      setForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });

      setTimeout(() => {
        setStatus("idle");
      }, 5000);

    } catch (error: any) {
      setStatus("error");
      
      if (error?.response?.data?.errors) {
        const serverErrors: FormErrors = {};
        const apiErrors = error.response.data.errors;
        
        if (apiErrors.name) serverErrors.name = apiErrors.name[0];
        if (apiErrors.email) serverErrors.email = apiErrors.email[0];
        if (apiErrors.phone) serverErrors.phone = apiErrors.phone[0];
        if (apiErrors.message) serverErrors.message = apiErrors.message[0];
        
        setErrors(serverErrors);
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.");
      }

      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
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

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-stretch">
        {/* نموذج التواصل */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5 glass rounded-2xl p-6 md:p-8 h-full">
          
          {/* Honeypot Fields */}
          <input
            type="text"
            name="website"
            value={honeypot.website}
            onChange={(e) => setHoneypot({ ...honeypot, website: e.target.value })}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="text"
            name="url"
            value={honeypot.url}
            onChange={(e) => setHoneypot({ ...honeypot, url: e.target.value })}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <Field 
            label={t.contact.name} 
            htmlFor="contact-name"
            error={errors.name}
          >
            <Input
              id="contact-name"
              required
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={errors.name ? "border-error" : ""}
              maxLength={100}
            />
          </Field>

          <Field 
            label={t.contact.email} 
            htmlFor="contact-email"
            error={errors.email}
          >
            <Input
              id="contact-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={errors.email ? "border-error" : ""}
              placeholder="example@gmail.com"
            />
          </Field>

          <Field 
            label={t.contact.phone || "Phone Number"} 
            htmlFor="contact-phone"
            error={errors.phone}
          >
            <PhoneInput
              id="contact-phone"
              international
              defaultCountry="SA"
              value={form.phone}
              onChange={(value) => {
                setForm({ ...form, phone: value || "" });
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={`phone-input ${errors.phone ? "border-error" : ""}`}
              placeholder="+966 50 123 4567"
            />
          </Field>

          <Field 
            label={t.contact.message} 
            htmlFor="contact-message"
            error={errors.message}
          >
            <Textarea
              id="contact-message"
              required
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
              className={`flex-1 min-h-[140px] resize-none ${errors.message ? "border-error" : ""}`}
              maxLength={5000}
            />
            <div className="text-xs text-on-surface-variant mt-1 text-end">
              {form.message.length} / 5000
            </div>
          </Field>

          {/* ✅ Submit Button & Status Messages */}
          <div className="space-y-3">
            <Button type="submit" disabled={status === "sending"} className="w-full">
              {status === "sending" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.contact.sending}
                </span>
              ) : (
                t.contact.send
              )}
            </Button>

            {/* ✅ Success Message - محسّنة */}
            {status === "sent" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-xl p-4 border-2 border-primary/30 bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-1">
                      {locale === 'ar' ? '✅ تم الإرسال بنجاح!' : '✅ Message Sent Successfully!'}
                    </h4>
                    <p className="text-sm text-on-surface-variant">
                      {t.contact.sent}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ✅ Error Message - محسّنة */}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-xl p-4 border-2 border-error/30 bg-error/5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-error mb-1">
                      {locale === 'ar' ? '❌ فشل الإرسال' : '❌ Failed to Send'}
                    </h4>
                    <p className="text-sm text-on-surface-variant">
                      {errorMessage || t.contact.error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </form>

        {/* معلومات الاتصال */}
        <div className="flex flex-col gap-6 md:gap-8 h-full">
          {loading && <LoadingState />}
          {info && (
            <div className="glass rounded-2xl p-6 md:p-8 flex flex-col gap-5">
              <ContactRow label={t.contact.emailLabel} value={info.email} href={`mailto:${info.email}`} />
              <ContactRow label={t.contact.phoneLabel} value={info.phone} href={`tel:${info.phone}`} />
              {info.address && <ContactRow label={t.contact.addressLabel} value={info.address} />}
              <ContactRow
                label={t.contact.whatsapp}
                value={info.whatsapp}
                href={`https://wa.me/${info.whatsapp.replace(/[^\d]/g, "")}`}
              />
              <SocialIcons className="mt-2 pt-2 border-t border-outline-variant/10" />
            </div>
          )}
          {info?.mapEmbedUrl && (
            <div className="rounded-2xl overflow-hidden glass flex-1 min-h-[240px] md:min-h-[260px] w-full">
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
      <span className="font-mono-label text-label-sm uppercase text-on-surface-variant/70 block mb-1">
        {label}
      </span>
      <span className="text-on-surface font-medium">{value}</span>
    </>
  );
  return href ? (
    <a href={href} className="hover:text-primary transition-colors block">
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}