import { useRef, useState, type DragEvent } from 'react';
import { Input } from './Form';
import api from '../../services/apiClient';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string, file?: File) => void;
  accept?: string;
  label?: string;
  previewType?: 'image' | 'video';
  folder?: string;
}

// ✅ Cloudinary Embed URL
function getCloudinaryEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('player.cloudinary.com/embed/')) {
    return url;
  }
  return null;
}

// ✅ Cloudinary Direct Video URL
function getCloudinaryDirectVideoUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('player.cloudinary.com')) {
      const cloudName = parsedUrl.searchParams.get('cloud_name');
      const publicId = parsedUrl.searchParams.get('public_id');
      if (cloudName && publicId) {
        return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
      }
    }
  } catch {}
  return null;
}

// ✅ YouTube Embed
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

// ✅ Vimeo Embed
function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
  const match = url.match(regExp);
  return match && match[1]
    ? `https://player.vimeo.com/video/${match[1]}`
    : null;
}


// ✅ فحص إذا كان URL فيديو
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const patterns = [
    /(youtube\.com|youtu\.be)/i,
    /vimeo\.com/i,
    /facebook\.com\/(share|watch|videos?)/i,
    /instagram\.com\/(p|reel|tv)/i,
    /tiktok\.com\/.*\/video/i,
    /(cloudinary\.com\/.*\/video\/upload|player\.cloudinary\.com)/i,
    /\.(mp4|m3u8|webm|ogg|mov|flv|avi)(\?.*)?$/i,
  ];
  return patterns.some(pattern => pattern.test(url));
}

export function MediaUploader({
  value,
  onChange,
  accept = 'image/*',
  label,
  previewType,
  folder = 'phoenix_media',
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isDetectedVideo = isVideoUrl(value);
  const resolvedPreviewType: 'image' | 'video' =
    previewType ?? (isDetectedVideo || accept.startsWith('video') ? 'video' : 'image');

  // استخراج روابط Embed
  const youtubeEmbedUrl = getYouTubeEmbedUrl(value);
  const vimeoEmbedUrl = getVimeoEmbedUrl(value);
  const cloudinaryEmbedUrl = getCloudinaryEmbedUrl(value);
  const cloudinaryDirectMp4 = getCloudinaryDirectVideoUrl(value);
  
  const videoSourceUrl = cloudinaryDirectMp4 || value;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    abortControllerRef.current = new AbortController();

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.post('/admin/media/upload', formData, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      const uploadedUrl =
        response.data?.data?.url ||
        response.data?.url ||
        response.data;

      if (typeof uploadedUrl === 'string') {
        onChange(uploadedUrl, file);
      } else {
        throw new Error('تنسيق استجابة السيرفر غير صحيح');
      }

    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Upload canceled by user');
        return;
      }

      console.error('Upload failed:', error);
      setUploadError(
        error.response?.data?.message || error.message || 'فشل رفع الملف'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleCancelUpload(e: React.MouseEvent) {
    e.stopPropagation();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors relative ${
          isDraggingOver
            ? 'border-primary bg-primary/5'
            : uploading
            ? 'border-primary/40 bg-surface-variant/20 cursor-default'
            : 'border-outline-variant hover:border-primary/60 cursor-pointer'
        }`}
      >
        {uploading ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-on-surface-variant">
              جارٍ الرفع... {uploadProgress}%
            </p>
            <div className="w-full bg-surface-variant/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <button
              type="button"
              onClick={handleCancelUpload}
              className="mt-2 text-xs text-error border border-error/30 hover:bg-error/10 px-3 py-1 rounded-md transition-colors"
            >
              إلغاء الرفع
            </button>
          </div>
        ) : value ? (
          resolvedPreviewType === 'video' ? (
            youtubeEmbedUrl ? (
              /* ✅ YouTube Preview */
              <div className="aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md" onClick={(e) => e.stopPropagation()}>
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                />
              </div>
            ) : vimeoEmbedUrl ? (
              /* ✅ Vimeo Preview */
              <div className="aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md" onClick={(e) => e.stopPropagation()}>
                <iframe
                  src={vimeoEmbedUrl}
                  title="Vimeo Preview"
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                />
              </div>
            ) : cloudinaryEmbedUrl ? (
              /* ✅ Cloudinary Player Embed */
              <div className="aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md" onClick={(e) => e.stopPropagation()}>
                <iframe
                  src={cloudinaryEmbedUrl}
                  title="Cloudinary Video Preview"
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                />
              </div>
            ) : (
              /* ✅ Direct Video (MP4/Cloudinary Direct) */
              <video
                src={videoSourceUrl}
                controls
                muted
                loop
                playsInline
                className="max-h-40 mx-auto rounded-md object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )
          ) : (
            /* ✅ Image Preview */
            <img
              src={value}
              alt={label ?? 'Preview'}
              className="max-h-40 mx-auto rounded-md object-contain"
            />
          )
        ) : (
          <div className="space-y-2">
            <svg
              className="w-12 h-12 mx-auto text-on-surface-variant/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-on-surface-variant">
              اسحب وأفلت ملفاً هنا، أو انقر للتصفح
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {/* URL Input */}
      <Input
        placeholder="…أو الصق رابط الملف مباشرة (YouTube, Facebook, Vimeo, Instagram, TikTok, Cloudinary...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={uploading}
        dir="ltr"
      />

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20">
          <p className="text-error text-sm">{uploadError}</p>
        </div>
      )}

      {/* Current URL Display */}
      {value && !uploading && (
        <div className="text-xs text-on-surface-variant/60 break-all">
          <span className="font-medium">الرابط الحالي:</span> {value}
        </div>
      )}
    </div>
  );
}