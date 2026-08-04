import { useRef, useState, type DragEvent } from "react";
import { Input } from "./Form";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  /** Explicit preview kind. Defaults to inferring from `accept`. */
  previewType?: "image" | "video";
}

/**
 * There's no real file-storage backend in this demo, so a dropped/selected
 * file becomes a local object URL — visually identical to a real upload
 * from the admin's point of view. Swapping in real storage means changing
 * `handleFiles` to POST to an upload endpoint and use the returned URL.
 */
export function MediaUploader({
  value,
  onChange,
  accept = "image/*",
  label,
  previewType,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const resolvedPreviewType: "image" | "video" =
    previewType ?? (accept.startsWith("video") ? "video" : "image");

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
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
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDraggingOver
            ? "border-primary bg-primary/5"
            : "border-outline-variant hover:border-primary/60"
        }`}
      >
        {value ? (
          resolvedPreviewType === "video" ? (
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
              alt={label ?? "Preview"}
              className="max-h-40 mx-auto rounded-md object-contain"
            />
          )
        ) : (
          <p className="text-sm text-on-surface-variant">
            Drop a file here, or click to browse
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <Input
        placeholder="…or paste a media URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
