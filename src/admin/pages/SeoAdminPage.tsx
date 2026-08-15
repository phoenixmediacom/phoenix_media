import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getSeoSettings, updateSeoSettings } from "../../services/endpoints/seo";
import type { SeoSettings } from "../../services/types";
import { Field, Input, Textarea } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

export default function SeoAdminPage() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useAsync(() => getSeoSettings(), []);
  const [form, setForm] = useState<SeoSettings | null>(null);
  const [keywordsText, setKeywordsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
      setKeywordsText(data.keywords?.join(", ") ?? "");
    }
  }, [data]);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    setFormError(null);

    // تحويل النص المفصول بفواصل إلى مصفوفة الكلمات المفتاحية
    const parsedKeywords = keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const updatedPayload: SeoSettings = {
      ...form,
      keywords: parsedKeywords,
      ogImageType: "url",
    };

    try {
      await updateSeoSettings(updatedPayload);
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to update SEO settings", err);
      setFormError("حدث خطأ أثناء حفظ إعدادات محركات البحث.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !form) return <LoadingState />;
  if (error && !form) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.seoModule}
      </h1>

      {formError && (
        <div className="bg-error/15 border border-error/30 text-error p-3 rounded-lg text-sm mb-6">
          {formError}
        </div>
      )}

      {form && (
        <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
          {/* عنوان الصفحة */}
          <Field label="Page title" htmlFor="seo-title">
            <Input
              id="seo-title"
              value={form.pageTitle}
              onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
            />
          </Field>

          {/* الوصف (Meta Description) */}
          <Field label="Meta description" htmlFor="seo-desc">
            <Textarea
              id="seo-desc"
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            />
          </Field>

          {/* الكلمات المفتاحية (Keywords) */}
          <Field label="Keywords (افصل بينها بفصلة ,)" htmlFor="seo-keywords">
            <Input
              id="seo-keywords"
              placeholder="مثال: تصوير, إنتاج سينمائي, إعلام"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
            />
          </Field>

          {/* صورة المشاركة (Social Share Image) */}
          <Field label="Social share image (social_share_image)" htmlFor="seo-og">
            <MediaUploader
              value={form.ogImageUrl ?? ""}
              onChange={(url) => setForm({ ...form, ogImageUrl: url, ogImageType: "url" })}
            />
          </Field>

          <div className="flex items-center gap-4">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "…" : t.common.save}
            </Button>
            {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
          </div>
        </div>
      )}
    </div>
  );
}