import { useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../contexts/ThemeContext"; // ✅ إضافة
import type { LogoItem } from "../../services/types";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Form";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

interface LogoCollectionAdminProps {
  title: string;
  list: () => Promise<LogoItem[]>;
  create: (input: Omit<LogoItem, "id" | "order">) => Promise<LogoItem>;
  update: (id: string, patch: Partial<LogoItem>) => Promise<LogoItem>;
  remove: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<LogoItem[]>;
}

export function LogoCollectionAdmin({
  title,
  list,
  create,
  update,
  remove,
  reorder,
}: LogoCollectionAdminProps) {
  const { t } = useI18n();
  const { theme } = useTheme(); // ✅ إضافة
  const { data, loading, error, refetch } = useAsync(list, []);
  const [modalItem, setModalItem] = useState<LogoItem | "new" | null>(null);
  const [draft, setDraft] = useState({ name: "", logoUrl: "" });
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  function openNew() {
    setDraft({ name: "", logoUrl: "" });
    setModalItem("new");
  }

  function openEdit(item: LogoItem) {
    setDraft({ name: item.name, logoUrl: item.logoUrl });
    setModalItem(item);
  }

  async function onSave() {
    if (modalItem === "new") {
      await create(draft);
    } else if (modalItem) {
      await update(modalItem.id, draft);
    }
    setModalItem(null);
    refetch();
  }

  async function onDelete(id: string) {
    if (!confirm(t.common.delete + "?")) return;
    await remove(id);
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">{title}</h1>
        <Button onClick={openNew}>{t.common.add}</Button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && data.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-on-surface-variant mb-4">No items yet</p>
          <Button onClick={openNew} size="sm">Add first item</Button>
        </div>
      )}

      {data && data.length > 0 && (
        <ReorderList
          items={data}
          onReorder={(ids) => reorder(ids).then(() => refetch())}
          renderItem={(item) => (
            <div className="flex items-center gap-4 glass rounded-lg p-4 cursor-grab active:cursor-grabbing hover:border-primary transition-colors group">
              {/* ✅ Drag Handle */}
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>

              {/* ✅ Logo Preview - بنفس أسلوب الـ Public Sections */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                {item.logoUrl && !imgError[item.id] ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    onError={() => setImgError({ ...imgError, [item.id]: true })}
                    className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                      theme === "dark"
                        ? "brightness-90 group-hover:brightness-110"
                        : "brightness-95 group-hover:brightness-100"
                    }`}
                    style={{
                      filter:
                        theme === "dark"
                          ? "invert(0) brightness(0.9) contrast(1.1)"
                          : "invert(0) brightness(1.05) contrast(0.95)",
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg glass flex items-center justify-center">
                    <span className="text-xs text-on-surface-variant">
                      {item.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* ✅ Name */}
              <span className="flex-1 font-medium text-on-surface">{item.name}</span>

              {/* ✅ Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  {t.common.edit}
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(item.id)}>
                  {t.common.delete}
                </Button>
              </div>
            </div>
          )}
        />
      )}

      {/* ✅ Modal */}
      <Modal
        open={modalItem !== null}
        onClose={() => setModalItem(null)}
        title={modalItem === "new" ? t.common.create : t.common.edit}
      >
        <div className="flex flex-col gap-5">
          {/* ✅ Logo Preview في Modal */}
          {draft.logoUrl && (
            <div className="flex justify-center p-6 glass rounded-xl">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <img
                  src={draft.logoUrl}
                  alt="Preview"
                  className={`max-w-full max-h-full object-contain ${
                    theme === "dark" ? "brightness-90" : "brightness-95"
                  }`}
                  style={{
                    filter:
                      theme === "dark"
                        ? "invert(0) brightness(0.9) contrast(1.1)"
                        : "invert(0) brightness(1.05) contrast(0.95)",
                  }}
                />
              </div>
            </div>
          )}

          <Field label="Name" htmlFor="logo-name" >
            <Input
              id="logo-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Netflix, Canon, Sony..."
              required
            />
          </Field>

          <Field label="Logo" htmlFor="logo-file" >
            <MediaUploader
              value={draft.logoUrl}
              onChange={(url) => setDraft({ ...draft, logoUrl: url })}
            />
            <p className="text-xs text-on-surface-variant mt-2">
              💡 Tip: Upload PNG with transparent background for best results
            </p>
          </Field>

          <div className="flex gap-3 pt-4 border-t border-glass-border">
            <Button onClick={onSave} disabled={!draft.name || !draft.logoUrl} className="flex-1">
              {t.common.save}
            </Button>
            <Button variant="ghost" onClick={() => setModalItem(null)}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}