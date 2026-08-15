import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { useAsync } from '../../hooks/useAsync';
import { getHero, updateHero } from '../../services/endpoints/hero';
import type { HeroContent, VideoSourceType } from '../../services/types';
import { Field, Input, Select } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { MediaUploader } from '../../components/ui/MediaUploader';
import { LoadingState, ErrorState } from '../../components/ui/AsyncStates';

const MAX_DIRECT_UPLOAD_MB = 100;
const MAX_DIRECT_UPLOAD_BYTES = MAX_DIRECT_UPLOAD_MB * 1024 * 1024;

export default function HeroAdminPage() {
  const { t } = useI18n();
  const { data, loading, error } = useAsync(() => getHero(), []);
  const [form, setForm] = useState<HeroContent | null>(null);

  const [editingLang, setEditingLang] = useState<'en' | 'ar'>('en');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLargeVideo, setIsLargeVideo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleVideoFileChange = (file: File | null) => {
    if (!file) {
      setVideoFile(null);
      setIsLargeVideo(false);
      return;
    }

    if (file.size > MAX_DIRECT_UPLOAD_BYTES) {
      setIsLargeVideo(true);
      setVideoFile(null);
    } else {
      setIsLargeVideo(false);
      setVideoFile(file);
    }
  };

  async function onSave() {
    if (!form) return;

    setSaving(true);
    setSaveError(null);

    try {
      const updated = await updateHero(form, { logoFile, videoFile });
      setForm(updated);
      setLogoFile(null);
      setVideoFile(null);
      setIsLargeVideo(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      if (
        err?.response?.status === 413 ||
        err?.message?.includes('POST data is too large') ||
        err?.message?.includes('PostTooLargeException')
      ) {
        setSaveError(`حجم الملف كبير جداً للرفع المباشر (يتجاوز ${MAX_DIRECT_UPLOAD_MB} ميجابايت). يرجى رفع الفيديو على خدمة سحابية وإدخال الرابط.`);
      } else {
        setSaveError(err.message || 'حدث خطأ أثناء الحفظ');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">
          {t.admin.heroModule}
        </h1>

        <div className="flex gap-2">
          <Button
            variant={editingLang === 'en' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setEditingLang('en')}
          >
            English
          </Button>
          <Button
            variant={editingLang === 'ar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setEditingLang('ar')}
          >
            العربية
          </Button>
        </div>
      </div>

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

        {/* Tagline */}
        {editingLang === 'en' ? (
          <Field label="Tagline (English)" htmlFor="tagline-en">
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
        ) : (
          <Field label="Tagline (العربية)" htmlFor="tagline-ar">
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
        )}

        {/* Logo */}
        <Field label="Logo" htmlFor="logo">
          <MediaUploader
            value={form.logoUrl}
            onChange={(url: string, file?: File) => {
              setForm({ ...form, logoUrl: url });
              if (file) setLogoFile(file);
            }}
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
            onChange={(e) => {
              const newType = e.target.value as VideoSourceType;
              setIsLargeVideo(false);
              setVideoFile(null);
              setForm({
                ...form,
                video: { ...form.video, type: newType },
              });
            }}
          >
            <option value="upload">Upload (رفع ملف فيديو)</option>
            <option value="youtube">YouTube ✅</option>
            <option value="vimeo">Vimeo ✅</option>
          </Select>
        </Field>

        {/* Video URL/Upload */}
        {form.video.type === 'upload' ? (
          <div className="space-y-4">
            <Field
              label="Video file"
              htmlFor="video-file"
              hint={`الحد الأقصى للرفع المباشر ${MAX_DIRECT_UPLOAD_MB} ميجابايت`}
            >
              <MediaUploader
                accept="video/*"
                value={form.video.url}
                onChange={(url: string, file?: File) => {
                  if (file) {
                    handleVideoFileChange(file);
                  } else {
                    setForm({ ...form, video: { ...form.video, url } });
                  }
                }}
              />
            </Field>

            {/* تنويه نصي */}
            <div className="p-4 rounded-xl bg-surface-variant/20 border border-outline-variant/30 text-on-surface-variant dir-rtl">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-semibold text-on-surface">تنويه بشأن مقاطع الفيديو الطويلة أو ذات الحجم الكبير:</p>
                  <p className="opacity-80 leading-relaxed">
                    إذا كان حجم الفيديو يتجاوز <strong>{MAX_DIRECT_UPLOAD_MB} ميجابايت</strong>، يمكنك رفعه على أي خدمة سحابية خارجية (مثل Cloudinary، Google Drive، Dropbox، أو OneDrive) ثم إدخال رابط الفيديو المباشر في الحقل أدناه.
                  </p>
                </div>
              </div>
            </div>

            {/* إشعار ملف كبير */}
            {isLargeVideo && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 dir-rtl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-amber-300">الملف كبير جداً للرفع المباشر (يتجاوز {MAX_DIRECT_UPLOAD_MB}MB)</p>
                    <p className="text-xs opacity-90">
                      يرجى رفع الفيديو على خدمة سحابية ثم وضع رابط الفيديو المباشر في حقل الرابط أدناه.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Direct URL Input */}
            <Field
              label="Direct Video URL (رابط الفيديو المباشر)"
              htmlFor="direct-video-url"
              hint="الصق رابط الفيديو المباشر (e.g. https://res.cloudinary.com/.../video.mp4)"
            >
              <Input
                id="direct-video-url"
                value={form.video.url}
                onChange={(e) =>
                  setForm({ ...form, video: { ...form.video, url: e.target.value } })
                }
                placeholder="https://..."
                dir="ltr"
              />
            </Field>
          </div>
        ) : (
          <Field
            label={getVideoTypeLabel(form.video.type)}
            htmlFor="video-url"
            hint={getVideoTypeHint(form.video.type)}
          >
            <Input
              id="video-url"
              value={form.video.url}
              onChange={(e) =>
                setForm({ ...form, video: { ...form.video, url: e.target.value } })
              }
              placeholder={getVideoTypePlaceholder(form.video.type)}
              dir="ltr"
            />
          </Field>
        )}

        {/* ✅ Video Preview - محسّن مع معالجة الأخطاء */}
        {form.video.url && form.video.type !== 'upload' && (
          <div className="p-4 bg-surface-variant/10 rounded-lg">
            <p className="text-xs text-on-surface-variant mb-2">معاينة الفيديو:</p>
            <div className="aspect-video bg-surface-variant/20 rounded-lg overflow-hidden relative">
              {renderVideoPreview(form.video.type, form.video.url)}
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

// ✅ Helper Functions
function getVideoTypeLabel(type: VideoSourceType): string {
  const labels: Record<VideoSourceType, string> = {
    youtube: 'YouTube URL',
    vimeo: 'Vimeo URL',
    upload: 'Direct Video URL',
  };
  return labels[type] || 'Video URL';
}

function getVideoTypeHint(type: VideoSourceType): string {
  const hints: Record<VideoSourceType, string> = {
    youtube: 'مثال: https://youtube.com/watch?v=... أو https://youtu.be/...',
    vimeo: 'مثال: https://vimeo.com/123456789',
    upload: '',
  };
  return hints[type] || '';
}

function getVideoTypePlaceholder(type: VideoSourceType): string {
  const placeholders: Record<VideoSourceType, string> = {
    youtube: 'https://youtube.com/watch?v=…',
    vimeo: 'https://vimeo.com/…',
    upload: 'https://…',
  };
  return placeholders[type] || 'https://…';
}

// ✅ Render Video Preview - مع معالجة أخطاء محسّنة
function renderVideoPreview(type: VideoSourceType, url: string) {
  switch (type) {
    case 'youtube': {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return <PreviewError message="Invalid YouTube URL" />;
      }
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }

    case 'vimeo': {
      const videoId = extractVimeoId(url);
      if (!videoId) {
        return <PreviewError message="Invalid Vimeo URL" />;
      }
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }

    default:
      return <PreviewError message="Unsupported video type" />;
  }
}

// ✅ مكون لعرض أخطاء المعاينة
function PreviewError({ message, details }: { message: string; details?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-error/5 text-error p-4">
      <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="font-semibold text-sm">{message}</p>
      {details && <p className="text-xs opacity-80 mt-1">{details}</p>}
    </div>
  );
}

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