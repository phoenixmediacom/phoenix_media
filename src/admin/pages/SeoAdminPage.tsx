import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getSeoSettings, updateSeoSettings } from "../../services/endpoints/seo";
import type { SeoSettings } from "../../services/types";
import { Field, Input, Textarea } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { LoadingState } from "../../components/ui/AsyncStates";

export default function SeoAdminPage() {
  const { t } = useI18n();
  const { data, loading } = useAsync(() => getSeoSettings(), []);
  const [form, setForm] = useState<SeoSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    await updateSeoSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !form) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">{t.admin.seoModule}</h1>
      <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
        <Field label="Page title" htmlFor="seo-title">
          <Input
            id="seo-title"
            value={form.pageTitle}
            onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
          />
        </Field>
        <Field label="Meta description" htmlFor="seo-desc">
          <Textarea
            id="seo-desc"
            value={form.metaDescription}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
          />
        </Field>
        <Field label="Social share image (og:image)" htmlFor="seo-og">
          <MediaUploader
            value={form.ogImageUrl ?? ""}
            onChange={(url) => setForm({ ...form, ogImageUrl: url })}
          />
        </Field>
        <div className="flex items-center gap-4">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
        </div>
      </div>
    </div>
  );
}
