import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { useAsync } from '../../hooks/useAsync';
import { getHero, updateHero } from '../../services/endpoints/hero';
import type { HeroContent, VideoSourceType } from '../../services/types';
import { Field, Input, Select } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { MediaUploader } from '../../components/ui/MediaUploader';
import { LoadingState, ErrorState } from '../../components/ui/AsyncStates';

export default function HeroAdminPage() {
  const { t } = useI18n();
  const { data, loading, error } = useAsync(() => getHero(), []);
  const [form, setForm] = useState<HeroContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const updated = await updateHero(form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.heroModule}
      </h1>

      <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
        {/* Company Name */}
        <Field label="Company name" htmlFor="company-name">
          <Input
            id="company-name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="Phoenix Media"
          />
        </Field>

        {/* Tagline (Multi-language) */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-on-surface">
            Tagline (عنوان فرعي)
          </label>
          
          <Field label="English" htmlFor="tagline-en">
            <Input
              id="tagline-en"
              value={form.tagline.en}
              onChange={(e) =>
                setForm({
                  ...form,
                  tagline: { ...form.tagline, en: e.target.value },
                })
              }
              placeholder="Cinematic Production House"
            />
          </Field>

          <Field label="Arabic (العربية)" htmlFor="tagline-ar">
            <Input
              id="tagline-ar"
              value={form.tagline.ar}
              onChange={(e) =>
                setForm({
                  ...form,
                  tagline: { ...form.tagline, ar: e.target.value },
                })
              }
              placeholder="بيت إنتاج سينمائي"
              dir="rtl"
            />
          </Field>
        </div>

        {/* Logo */}
        <Field label="Logo" htmlFor="logo">
          <MediaUploader
            value={form.logoUrl}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
            accept="image/*"
          />
          {form.logoUrl && (
            <div className="mt-3 p-3 bg-surface-variant/10 rounded-lg">
              <p className="text-xs text-on-surface-variant mb-2">معاينة:</p>
              <img
                src={form.logoUrl}
                alt="Logo preview"
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
        </Field>

        {/* Video Source Type */}
        <Field
          label="Background video source"
          htmlFor="video-type"
          hint="اختر نوع مصدر الفيديو الخلفي"
        >
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
            <option value="upload">Upload a video file (رفع ملف فيديو)</option>
            <option value="youtube">YouTube link (رابط يوتيوب)</option>
            <option value="vimeo">Vimeo link (رابط فيميو)</option>
          </Select>
        </Field>

        {/* Video URL/Upload */}
        {form.video.type === 'upload' ? (
          <Field
            label="Video file"
            htmlFor="video-file"
            hint="قم برفع ملف فيديو أو الصق رابط مباشر"
          >
            <MediaUploader
              accept="video/*"
              value={form.video.url}
              onChange={(url) => setForm({ ...form, video: { ...form.video, url } })}
            />
          </Field>
        ) : (
          <Field
            label={form.video.type === 'youtube' ? 'YouTube URL' : 'Vimeo URL'}
            htmlFor="video-url"
            hint={
              form.video.type === 'youtube'
                ? 'مثال: https://youtube.com/watch?v=...'
                : 'مثال: https://vimeo.com/...'
            }
          >
            <Input
              id="video-url"
              value={form.video.url}
              onChange={(e) =>
                setForm({ ...form, video: { ...form.video, url: e.target.value } })
              }
              placeholder={
                form.video.type === 'youtube'
                  ? 'https://youtube.com/watch?v=…'
                  : 'https://vimeo.com/…'
              }
              dir="ltr"
            />
          </Field>
        )}

        {/* Video Preview */}
        {form.video.url && form.video.type !== 'upload' && (
          <div className="p-4 bg-surface-variant/10 rounded-lg">
            <p className="text-xs text-on-surface-variant mb-2">معاينة الفيديو:</p>
            <div className="aspect-video bg-surface-variant/20 rounded-lg overflow-hidden">
              {form.video.type === 'youtube' && (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(form.video.url)}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
              {form.video.type === 'vimeo' && (
                <iframe
                  src={`https://player.vimeo.com/video/${extractVimeoId(form.video.url)}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20">
            <p className="text-error text-sm">{saveError}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-glass-border">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'جارٍ الحفظ...' : t.common.save}
          </Button>
          {saved && (
            <span className="text-primary text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t.common.saved}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : '';
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : '';
}