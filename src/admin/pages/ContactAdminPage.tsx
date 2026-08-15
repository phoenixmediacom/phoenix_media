import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getContactInfo, updateContactInfo } from "../../services/endpoints/contact";
import type { ContactInfo } from "../../services/types";
import { Field, Input } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/AsyncStates";

// أسماء الحقول المترجمة باللغة العربية
const fieldLabelsAr: Record<string, string> = {
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  address: "العنوان",
  whatsapp: "رقم الواتساب",
  google_maps_embed_url: "رابط تضمين خرائط Google",
  mapEmbedUrl: "رابط تضمين خرائط Google",
};

export default function ContactAdminPage() {
  const { t } = useI18n();
  const { data, loading, refetch } = useAsync(() => getContactInfo(), []);
  const [form, setForm] = useState<ContactInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    setFormErrors([]);
    setSaving(true);
    setSaved(false);

    try {
      const updated = await updateContactInfo(form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to update contact info", err);
      const responseData = err?.response?.data || err?.data || err;
      const errorsObj = responseData?.errors;

      if (errorsObj && typeof errorsObj === "object") {
        const messages: string[] = [];
        Object.keys(errorsObj).forEach((key) => {
          const readableLabel = fieldLabelsAr[key] || key;
          messages.push(`حقل (${readableLabel}) يحتوي على صيغة غير صحيحة أو مطلوبة.`);
        });
        setFormErrors(messages);
      } else if (responseData?.message) {
        setFormErrors([responseData.message]);
      } else {
        setFormErrors(["حدث خطأ أثناء حفظ البيانات، يرجى التأكد من صحة المدخلات وإعادة المحاولة."]);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.contactModule}
      </h1>

      <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
        {/* عرض أخطاء الـ Validation إن وجدت */}
        {formErrors.length > 0 && (
          <div className="bg-error/15 border border-error/30 text-error p-3 rounded-lg text-sm flex flex-col gap-1">
            <p className="font-bold flex items-center gap-1">
              ⚠️ يرجى تصحيح الأخطاء التالية:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              {formErrors.map((errMessage, idx) => (
                <li key={idx}>{errMessage}</li>
              ))}
            </ul>
          </div>
        )}

        <Field label="Email" htmlFor="c-email">
          <Input
            id="c-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <Field label="Phone" htmlFor="c-phone">
          <Input
            id="c-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>

        <Field label="Address (optional)" htmlFor="c-address">
          <Input
            id="c-address"
            value={form.address ?? ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>

        <Field
          label="WhatsApp number"
          htmlFor="c-whatsapp"
          hint="Include country code, digits only e.g. 966501234567"
        >
          <Input
            id="c-whatsapp"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </Field>

        <Field label="Google Maps embed URL (optional)" htmlFor="c-map">
          <Input
            id="c-map"
            value={form.mapEmbedUrl ?? ""}
            onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
          />
        </Field>

        <div className="flex items-center gap-4">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">✓ {t.common.saved}</span>}
        </div>
      </div>
    </div>
  );
}