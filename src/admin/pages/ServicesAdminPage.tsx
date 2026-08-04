import { useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import {
  listServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from "../../services/endpoints/services";
import type { ServiceItem, ServiceIcon, LocalizedText } from "../../services/types";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Textarea, Select } from "../../components/ui/Form";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

const emptyLocalized: LocalizedText = { en: "", ar: "" };
const emptyDraft = {
  icon: { type: "fontawesome", value: "fa-solid fa-clapperboard" } as ServiceIcon,
  title: emptyLocalized,
  description: emptyLocalized,
};

function ServiceIconPreview({ icon }: { icon: ServiceIcon }) {
  if (icon.type === "image") {
    return icon.value ? (
      <img src={icon.value} alt="" className="h-8 w-8 object-contain" />
    ) : (
      <span className="text-xs text-on-surface-variant">No image</span>
    );
  }
  if (icon.type === "fontawesome") {
    return <i className={`${icon.value} text-2xl text-primary`} aria-hidden="true" />;
  }
  return <span className="text-2xl">{icon.value || "🎬"}</span>;
}

export default function ServicesAdminPage() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useAsync(() => listServices(), []);
  const [modalItem, setModalItem] = useState<ServiceItem | "new" | null>(null);
  const [draft, setDraft] = useState<typeof emptyDraft>(emptyDraft);
  const [editingLang, setEditingLang] = useState<"en" | "ar">("en");

  function openNew() {
    setDraft(emptyDraft);
    setModalItem("new");
  }
  function openEdit(item: ServiceItem) {
    setDraft({ icon: item.icon, title: item.title, description: item.description });
    setModalItem(item);
  }

  async function onSave() {
    if (modalItem === "new") await createService(draft);
    else if (modalItem) await updateService(modalItem.id, draft);
    setModalItem(null);
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">{t.admin.servicesModule}</h1>
        <Button onClick={openNew}>{t.common.add}</Button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <ReorderList
          items={data}
          onReorder={(ids) => reorderServices(ids).then(() => refetch())}
          renderItem={(item) => (
            <div className="flex items-center gap-4 glass rounded-lg p-4">
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>
              <span className="h-8 w-8 flex items-center justify-center">
                <ServiceIconPreview icon={item.icon} />
              </span>
              <div className="flex-1">
                <p className="font-medium text-on-surface">{item.title.en}</p>
                <p className="text-sm text-on-surface-variant line-clamp-1">
                  {item.description.en}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                {t.common.edit}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteService(item.id).then(() => refetch())}
              >
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
          <Field label="Icon type" htmlFor="svc-icon-type">
            <Select
              id="svc-icon-type"
              value={draft.icon.type}
              onChange={(e) => {
                const type = e.target.value as ServiceIcon["type"];
                const defaults: Record<ServiceIcon["type"], string> = {
                  emoji: "🎬",
                  image: "",
                  fontawesome: "fa-solid fa-clapperboard",
                };
                setDraft({ ...draft, icon: { type, value: defaults[type] } as ServiceIcon });
              }}
            >
              <option value="fontawesome">Font Awesome icon</option>
              <option value="emoji">Emoji</option>
              <option value="image">Upload image / logo</option>
            </Select>
          </Field>

          <div className="flex items-center gap-4">
            <span className="h-12 w-12 rounded-lg glass flex items-center justify-center shrink-0">
              <ServiceIconPreview icon={draft.icon} />
            </span>
            {draft.icon.type === "fontawesome" && (
              <Field label="Font Awesome class" htmlFor="svc-icon-value" hint="e.g. fa-solid fa-clapperboard — browse icons at fontawesome.com/search">
                <Input
                  id="svc-icon-value"
                  value={draft.icon.value}
                  onChange={(e) =>
                    setDraft({ ...draft, icon: { type: "fontawesome", value: e.target.value } })
                  }
                />
              </Field>
            )}
            {draft.icon.type === "emoji" && (
              <Field label="Emoji" htmlFor="svc-icon-value">
                <Input
                  id="svc-icon-value"
                  value={draft.icon.value}
                  onChange={(e) =>
                    setDraft({ ...draft, icon: { type: "emoji", value: e.target.value } })
                  }
                />
              </Field>
            )}
          </div>
          {draft.icon.type === "image" && (
            <MediaUploader
              value={draft.icon.value}
              onChange={(url) => setDraft({ ...draft, icon: { type: "image", value: url } })}
            />
          )}

          <div className="flex gap-2">
            <Button
              variant={editingLang === "en" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setEditingLang("en")}
            >
              English
            </Button>
            <Button
              variant={editingLang === "ar" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setEditingLang("ar")}
            >
              العربية
            </Button>
          </div>

          <Field label={`Title (${editingLang.toUpperCase()})`} htmlFor="svc-title">
            <Input
              id="svc-title"
              dir={editingLang === "ar" ? "rtl" : "ltr"}
              value={draft.title[editingLang]}
              onChange={(e) =>
                setDraft({ ...draft, title: { ...draft.title, [editingLang]: e.target.value } })
              }
            />
          </Field>
          <Field label={`Description (${editingLang.toUpperCase()})`} htmlFor="svc-desc">
            <Textarea
              id="svc-desc"
              dir={editingLang === "ar" ? "rtl" : "ltr"}
              value={draft.description[editingLang]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  description: { ...draft.description, [editingLang]: e.target.value },
                })
              }
            />
          </Field>
          <Button onClick={onSave}>{t.common.save}</Button>
        </div>
      </Modal>
    </div>
  );
}
