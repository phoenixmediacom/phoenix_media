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

// قاموس ترجمة أسماء الحقول لتوضيح الأخطاء للعميل بشكل فهم
const fieldLabelsAr: Record<string, string> = {
  "title.ar": "العنوان باللغة العربية",
  "title.en": "العنوان باللغة الإنجليزية",
  "description.ar": "الوصف باللغة العربية",
  "description.en": "الوصف باللغة الإنجليزية",
  "icon_type": "نوع الأيقونة",
  "icon_value": "قيمة الأيقونة",
  "icon_file": "ملف الأيقونة",
};

function ServiceIconPreview({ icon }: { icon: ServiceIcon }) {
  if (icon.type === "image") {
    return icon.value ? (
      <img src={icon.value} alt="" className="h-8 w-8 object-contain rounded" />
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
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [editingLang, setEditingLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  function openNew() {
    setDraft(emptyDraft);
    setIconFile(null);
    setFormErrors([]);
    setEditingLang("en");
    setModalItem("new");
  }

  function openEdit(item: ServiceItem) {
    setDraft({ icon: item.icon, title: item.title, description: item.description });
    setIconFile(null);
    setFormErrors([]);
    setEditingLang("en");
    setModalItem(item);
  }

  async function onSave() {
    setFormErrors([]);

    // 1. تحقق أولي في الفرونت إند لمعرفة الحقول الناقصة قبل الإرسال إلى الـ API
    const validationErrors: string[] = [];
    if (!draft.title.ar?.trim()) validationErrors.push("العنوان باللغة العربية");
    if (!draft.description.ar?.trim()) validationErrors.push("الوصف باللغة العربية");
    if (!draft.title.en?.trim()) validationErrors.push("العنوان باللغة الإنجليزية");
    if (!draft.description.en?.trim()) validationErrors.push("الوصف باللغة الإنجليزية");

    if (validationErrors.length > 0) {
      const messages = validationErrors.map((field) => `حقل (${field}) مطلوب.`);
      setFormErrors(messages);

      // التبديل التلقائي إلى التبويب الذي يحتوي على النقص
      if (!draft.title.ar?.trim() || !draft.description.ar?.trim()) {
        setEditingLang("ar");
      } else if (!draft.title.en?.trim() || !draft.description.en?.trim()) {
        setEditingLang("en");
      }
      return;
    }

    try {
      setSaving(true);
      if (modalItem === "new") {
        await createService({ ...draft, iconFile });
      } else if (modalItem && typeof modalItem !== "string") {
        await updateService(modalItem.id, { ...draft, iconFile });
      }
      setModalItem(null);
      refetch();
    } catch (err: any) {
      console.error("Failed to save service", err);

      // استخراج مرن لاستجابة الـ API مع مرونة في شكل الـ Response
      const responseData = err?.response?.data || err?.data || err;
      const errorsObj = responseData?.errors;

      if (errorsObj && typeof errorsObj === "object") {
        const errorMessages: string[] = [];
        let hasArError = false;
        let hasEnError = false;

        Object.keys(errorsObj).forEach((key) => {
          const readableLabel = fieldLabelsAr[key] || key;
          errorMessages.push(`حقل (${readableLabel}) مطلوب أو يحتوي على خطأ.`);

          if (key.endsWith(".ar")) hasArError = true;
          if (key.endsWith(".en")) hasEnError = true;
        });

        if (hasArError && !hasEnError) {
          setEditingLang("ar");
        } else if (hasEnError && !hasArError) {
          setEditingLang("en");
        }

        setFormErrors(errorMessages);
      } else if (responseData?.message) {
        setFormErrors([responseData.message]);
      } else {
        setFormErrors(["يرجى التأكد من تعبئة جميع الحقول المطلوبة باللغتين العربية والإنجليزية."]);
      }
    } finally {
      setSaving(false);
    }
  }

  // فحص ما إذا كان تبويب لغة معين يحتوي على خطأ حالي
  const arHasError = formErrors.some((msg) => msg.includes("باللغة العربية"));
  const enHasError = formErrors.some((msg) => msg.includes("باللغة الإنجليزية"));

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
              <span className="text-on-surface-variant/50 cursor-grab" aria-hidden="true">
                ⠿
              </span>
              <span className="h-8 w-8 flex items-center justify-center">
                <ServiceIconPreview icon={item.icon} />
              </span>
              <div className="flex-1">
                <p className="font-medium text-on-surface">{item.title.ar || item.title.en}</p>
                <p className="text-sm text-on-surface-variant line-clamp-1">
                  {item.description.ar || item.description.en}
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
                setDraft({ ...draft, icon: { type, value: defaults[type] } });
                setIconFile(null);
              }}
            >
              <option value="fontawesome">Font Awesome icon</option>
              <option value="emoji">Emoji</option>
              <option value="image">Upload image / logo</option>
            </Select>
          </Field>

          <div className="flex items-center gap-4">
            <span className="h-12 w-12 rounded-lg glass flex items-center justify-center shrink-0 overflow-hidden">
              <ServiceIconPreview
                icon={
                  draft.icon.type === "image" && iconFile
                    ? { type: "image", value: URL.createObjectURL(iconFile) }
                    : draft.icon
                }
              />
            </span>
            {draft.icon.type === "fontawesome" && (
              <Field
                label="Font Awesome class"
                htmlFor="svc-icon-value"
                hint="e.g. fa-solid fa-clapperboard"
              >
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
              onChange={(urlOrFile: string | File) => {
                if (typeof urlOrFile !== "string" && urlOrFile instanceof File) {
                  setIconFile(urlOrFile);
                } else if (typeof urlOrFile === "string") {
                  setDraft({ ...draft, icon: { type: "image", value: urlOrFile } });
                }
              }}
            />
          )}

          {/* تبويبات اللغات مع شارة تنبيه للغات الناقصة */}
          <div className="flex gap-2">
            <Button
              variant={editingLang === "en" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setEditingLang("en")}
              className="relative"
            >
              English
              {enHasError && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full animate-ping" />
              )}
            </Button>
            <Button
              variant={editingLang === "ar" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setEditingLang("ar")}
              className="relative"
            >
              العربية
              {arHasError && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full animate-ping" />
              )}
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

          {/* تنبيه الأخطاء الواضح للعميل */}
          {formErrors.length > 0 && (
            <div className="bg-error/15 border border-error/30 text-error p-3 rounded-lg text-sm flex flex-col gap-1">
              <p className="font-bold flex items-center gap-1">
                ⚠️ يرجى تصحيح البيانات التالية قبل الحفظ:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {formErrors.map((errMessage, idx) => (
                  <li key={idx}>{errMessage}</li>
                ))}
              </ul>
            </div>
          )}
          
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : t.common.save}
          </Button>
        </div>
      </Modal>
    </div>
  );
}