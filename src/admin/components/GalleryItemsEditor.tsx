import type { GalleryItem } from "../../services/types";
import { Button } from "../../components/ui/Button";
import { Select, Input } from "../../components/ui/Form";
import { MediaUploader } from "../../components/ui/MediaUploader";

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GalleryItemsEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  function update(id: string, patch: Partial<GalleryItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }
  function add() {
    onChange([...items, { id: newId(), type: "image", url: "" }]);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[100px_1fr_auto] gap-3 items-start">
          <Select
            value={item.type}
            onChange={(e) => update(item.id, { type: e.target.value as GalleryItem["type"] })}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </Select>
          <div className="flex flex-col gap-2">
            <MediaUploader
              accept={item.type === "video" ? "video/*" : "image/*"}
              value={item.url}
              onChange={(url) => update(item.id, { url })}
            />
            <Input
              placeholder="Caption (optional)"
              value={item.caption ?? ""}
              onChange={(e) => update(item.id, { caption: e.target.value })}
            />
          </div>
          <Button variant="danger" size="sm" onClick={() => remove(item.id)}>
            ✕
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={add} className="self-start">
        + Add media
      </Button>
    </div>
  );
}
