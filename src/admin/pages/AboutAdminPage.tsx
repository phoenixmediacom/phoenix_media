import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getAbout, updateAbout } from "../../services/endpoints/about";
import type { AboutContent } from "../../services/types";
import { Field, Input, Textarea, Select } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { LoadingState } from "../../components/ui/AsyncStates";

export default function AboutAdminPage() {
  const { t } = useI18n();
  const { data, loading } = useAsync(() => getAbout(), []);
  const [form, setForm] = useState<AboutContent | null>(null);
  const [editingLang, setEditingLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    await updateAbout(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !form) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.aboutModule}
      </h1>

      <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
        <div className="flex gap-2">
          <Button
            variant={editingLang === "en" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setEditingLang("en")}
          >
            English
          </Button>
          <Button
            variant={editingLang === "ar" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setEditingLang("ar")}
          >
            العربية
          </Button>
        </div>

        <Field label={`Title (${editingLang.toUpperCase()})`} htmlFor="about-title">
          <Input
            id="about-title"
            dir={editingLang === "ar" ? "rtl" : "ltr"}
            value={form.title[editingLang]}
            onChange={(e) =>
              setForm({ ...form, title: { ...form.title, [editingLang]: e.target.value } })
            }
          />
        </Field>

        <Field label={`Description (${editingLang.toUpperCase()})`} htmlFor="about-description">
          <Textarea
            id="about-description"
            dir={editingLang === "ar" ? "rtl" : "ltr"}
            rows={6}
            value={form.description[editingLang]}
            onChange={(e) =>
              setForm({
                ...form,
                description: { ...form.description, [editingLang]: e.target.value },
              })
            }
          />
        </Field>

        <Field label="Image (optional)" htmlFor="about-image">
          <MediaUploader
            value={form.imageUrl ?? ""}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />
        </Field>

        <Field label="Background Style" htmlFor="about-bg">
          <Select
            id="about-bg"
            value={form.backgroundVariant}
            onChange={(e) =>
              setForm({
                ...form,
                backgroundVariant: e.target.value as AboutContent["backgroundVariant"],
              })
            }
          >
            <option value="lightfall">Lightfall (animated streaks)</option>
            <option value="prism">Prism (rotating glass prism)</option>
            <option value="none">None</option>
          </Select>
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
