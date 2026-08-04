import { useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
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
  const { data, loading, error, refetch } = useAsync(list, []);
  const [modalItem, setModalItem] = useState<LogoItem | "new" | null>(null);
  const [draft, setDraft] = useState({ name: "", logoUrl: "" });

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

      {data && (
        <ReorderList
          items={data}
          onReorder={(ids) => reorder(ids).then(() => refetch())}
          renderItem={(item) => (
            <div className="flex items-center gap-4 glass rounded-lg p-4 cursor-grab active:cursor-grabbing">
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>
              <img src={item.logoUrl} alt={item.name} className="h-10 w-10 object-contain rounded bg-white/5" />
              <span className="flex-1 font-medium text-on-surface">{item.name}</span>
              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                {t.common.edit}
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(item.id)}>
                {t.common.delete}
              </Button>
            </div>
          )}
        />
      )}

      <Modal
        open={modalItem !== null}
        onClose={() => setModalItem(null)}
        title={modalItem === "new" ? t.common.create : t.common.edit}
      >
        <div className="flex flex-col gap-5">
          <Field label="Name" htmlFor="logo-name">
            <Input
              id="logo-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <Field label="Logo" htmlFor="logo-file">
            <MediaUploader value={draft.logoUrl} onChange={(url) => setDraft({ ...draft, logoUrl: url })} />
          </Field>
          <Button onClick={onSave}>{t.common.save}</Button>
        </div>
      </Modal>
    </div>
  );
}
