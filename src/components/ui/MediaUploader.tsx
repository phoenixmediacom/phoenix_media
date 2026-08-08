import { useRef, useState, type DragEvent } from 'react';
import { Input } from './Form';
import api from '../../services/apiClient';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  /** Explicit preview kind. Defaults to inferring from `accept`. */
  previewType?: 'image' | 'video';
  /** Custom folder in Cloudinary */
  folder?: string;
}

/**
 * MediaUploader with Cloudinary integration
 * Uploads files to backend which stores them in Cloudinary
 */
export function MediaUploader({
  value,
  onChange,
  accept = 'image/*',
  label,
  previewType,
  folder = 'phoenix_media',
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resolvedPreviewType: 'image' | 'video' =
    previewType ?? (accept.startsWith('video') ? 'video' : 'image');

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
  
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
  
      const response = await api.post<{
        message: string;
        data: {
          url: string;
          public_id: string;
        };
      }>('/admin/media/upload', formData, {
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
  
      onChange(response.data.data.url); // ← هنا يجب أن يحفظ Cloudinary URL
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(
        error.response?.data?.message || error.message || 'فشل رفع الملف'
      );
    } finally {
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
        className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors relative ${
          isDraggingOver
            ? 'border-primary bg-primary/5'
            : uploading
            ? 'border-primary/40 bg-surface-variant/20 cursor-wait'
            : 'border-outline-variant hover:border-primary/60'
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
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
          </div>
        ) : value ? (
          resolvedPreviewType === 'video' ? (
            <video
              src={value}
              muted
              loop
              autoPlay
              playsInline
              className="max-h-40 mx-auto rounded-md object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
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
            <p className="text-xs text-on-surface-variant/60">
              {accept === 'image/*'
                ? 'صور فقط (JPG, PNG, GIF)'
                : accept === 'video/*'
                ? 'فيديو فقط (MP4, WebM)'
                : 'جميع الملفات'}
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
        placeholder="…أو الصق رابط الملف مباشرة"
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