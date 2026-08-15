import type { GalleryItem } from "../../services/types";
import { Button } from "../../components/ui/Button";
import { Select, Input } from "../../components/ui/Form";
import { MediaUploader } from "../../components/ui/MediaUploader";

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// دالة مساعدة لاستخراج النص من الـ Caption سواء كان نصاً عادياً أو Object متعدد اللغات
function getCaptionString(caption: any): string {
  if (!caption) return "";
  if (typeof caption === "string") return caption;
  if (typeof caption === "object") {
    return caption.ar || caption.en || "";
  }
  return "";
}

// دالة فحص ما إذا كان الرابط هو فيديو (سواء Cloudinary, YouTube, Vimeo أو امتداد مباشر)
function checkIsVideo(url: string | undefined): boolean {
  if (!url) return false;
  const isYoutube = /(youtube\.com|youtu\.be)/i.test(url);
  const isVimeo = /vimeo\.com/i.test(url);
  const isCloudinaryVideo = /cloudinary\.com\/.*\/video\/upload/i.test(url);
  const isDirectVideo = /\.(mp4|m3u8|webm|ogg|mov|flv|avi)(\?.*)?$/i.test(url);
  return isYoutube || isVimeo || isCloudinaryVideo || isDirectVideo;
}

export function GalleryItemsEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  function update(id: string | number, patch: Partial<GalleryItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function remove(id: string | number) {
    onChange(items.filter((i) => i.id !== id));
  }

  function add() {
    onChange([...items, { id: newId(), type: "image", url: "" }]);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        // قراءة النوع القادم
        const rawType = (item as any).media_type || item.type;
        
        // إذا كان النوع غير محدد أو مفترض أنه image ولكن الرابط هو رابط فيديو فعلياً، نعتبره video
        const isUrlVideo = checkIsVideo(item.url);
        const itemType: "image" | "video" = isUrlVideo ? "video" : (rawType || "image");

        // استخراج النص من الكابشن بدقة
        const captionValue = getCaptionString(item.caption);

        return (
          <div key={item.id} className="grid grid-cols-[100px_1fr_auto] gap-3 items-start">
            <Select
              value={itemType}
              onChange={(e) => {
                const newType = e.target.value as GalleryItem["type"];
                update(item.id, { 
                  type: newType, 
                  ...( ('media_type' in item) && { media_type: newType } )
                });
              }}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </Select>

            <div className="flex flex-col gap-2">
              <MediaUploader
                accept={itemType === "video" ? "video/*" : "image/*"}
                previewType={itemType}
                value={item.url}
                onChange={(url) => {
                  const autoDetectedVideo = checkIsVideo(url);
                  const nextType = autoDetectedVideo ? "video" : itemType;
                  update(item.id, { 
                    url, 
                    type: nextType,
                    ...( ('media_type' in item) && { media_type: nextType } )
                  });
                }}
              />
              <Input
                placeholder="Caption (optional)"
                value={captionValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (typeof item.caption === "object" && item.caption !== null) {
                    update(item.id, {
                      caption: { ar: val, en: val } as any,
                    });
                  } else {
                    update(item.id, { caption: val });
                  }
                }}
              />
            </div>

            <Button variant="danger" size="sm" onClick={() => remove(item.id)}>
              ✕
            </Button>
          </div>
        );
      })}

      <Button variant="secondary" size="sm" onClick={add} className="self-start">
        + Add media
      </Button>
    </div>
  );
}