import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getHero, updateHero } from "../../services/endpoints/hero";
import type { HeroContent, VideoSourceType } from "../../services/types";
import { Field, Input, Select } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { LoadingState } from "../../components/ui/AsyncStates";

export default function HeroAdminPage() {
  const { t } = useI18n();
  const { data, loading } = useAsync(() => getHero(), []);
  const [form, setForm] = useState<HeroContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    await updateHero(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !form) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.heroModule}
      </h1>

      <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
        <Field label="Company name" htmlFor="company-name">
          <Input
            id="company-name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </Field>

        <Field label="Tagline" htmlFor="tagline">
          <Input
            id="tagline"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </Field>

        <Field label="Logo" htmlFor="logo">
          <MediaUploader value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} />
        </Field>

        <Field label="Background video source" htmlFor="video-type">
          <Select
            id="video-type"
            value={form.video.type}
            onChange={(e) =>
              setForm({
                ...form,
                video: { ...form.video, type: e.target.value as VideoSourceType },
              })
            }
          >
            <option value="upload">Upload a video file</option>
            <option value="youtube">YouTube link</option>
            <option value="vimeo">Vimeo link</option>
          </Select>
        </Field>

        {form.video.type === "upload" ? (
          <Field label="Video file" htmlFor="video-file" hint="Drop a video file or paste a direct URL">
            <MediaUploader
              accept="video/*"
              value={form.video.url}
              onChange={(url) => setForm({ ...form, video: { ...form.video, url } })}
            />
          </Field>
        ) : (
          <Field
            label={form.video.type === "youtube" ? "YouTube URL" : "Vimeo URL"}
            htmlFor="video-url"
          >
            <Input
              id="video-url"
              value={form.video.url}
              onChange={(e) => setForm({ ...form, video: { ...form.video, url: e.target.value } })}
              placeholder={
                form.video.type === "youtube"
                  ? "https://youtube.com/watch?v=…"
                  : "https://vimeo.com/…"
              }
            />
          </Field>
        )}

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
