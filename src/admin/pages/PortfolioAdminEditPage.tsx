import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import {
  getPortfolioEvent,
  createPortfolioEvent,
  updatePortfolioEvent,
} from "../../services/endpoints/portfolio";
import type { PortfolioEvent, PortfolioSection } from "../../services/types";
import { Field, Input, Checkbox } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Card";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import { PortfolioSectionEditor } from "../components/PortfolioSectionEditor";
import { generateUniqueSlug } from "../../utils/slug";

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// -------------------------------------------------------------
//  دوال التحقق (Validation Logic)
// -------------------------------------------------------------
const isLocalizedEmpty = (val: any): boolean => {
  if (!val) return true;
  if (typeof val === "string") return !val.trim();
  if (typeof val === "object") {
    return !val.ar?.trim() || !val.en?.trim();
  }
  return true;
};

export const validatePortfolioForm = (
  formData: PortfolioEvent,
  onError: (msg: string) => void
): boolean => {
  if (isLocalizedEmpty(formData.title)) {
    onError("يرجى إدخال عنوان المشروع باللغتين العربية والإنجليزية!");
    return false;
  }

  if (!formData.cover_image_url?.trim()) {
    onError("صورة الغلاف (Cover image) مطلوبة لحفظ الإيفينت!");
    return false;
  }

  if (formData.sections && formData.sections.length > 0) {
    for (let index = 0; index < formData.sections.length; index++) {
      const section = formData.sections[index];
      const secNum = index + 1;

      if (section.type === "hero-video") {
        if (!section.videoUrl?.trim()) {
          onError(`القسم رقم (${secNum}) من نوع فيديو: يرجى رفع ملف الفيديو أو إضافة الرابط!`);
          return false;
        }
      } else if (section.type === "gallery") {
        const items = section.items ?? (section as any)?.data?.items;
        if (!items || items.length === 0) {
          onError(`القسم رقم (${secNum}) من نوع معرض صور: يجب إضافة عنصر واحد على الأقل في المعرض!`);
          return false;
        }
      } else if (section.type === "text") {
        const textSec = section as Extract<PortfolioSection, { type: "text" }>;
        const heading = textSec.heading ?? (textSec as any)?.data?.heading;
        const body = textSec.body ?? (textSec as any)?.data?.body;

        if (isLocalizedEmpty(heading)) {
          onError(`القسم رقم (${secNum}) من نوع نص: يرجى إدخال العنوان الرئيسي (Heading) باللغتين العربية والإنجليزية!`);
          return false;
        }
        if (isLocalizedEmpty(body)) {
          onError(`القسم رقم (${secNum}) من نوع نص: يرجى إدخال محتوى النص (Body) باللغتين العربية والإنجليزية!`);
          return false;
        }
      } else if (section.type === "people") {
        const peopleSec = section as Extract<PortfolioSection, { type: "people" }>;
        const people = peopleSec.people ?? (peopleSec as any)?.data?.people;

        if (!people || people.length === 0) {
          onError(`القسم رقم (${secNum}) من نوع الأشخاص: يرجى إضافة شخص واحد على الأقل!`);
          return false;
        }
        for (let pIdx = 0; pIdx < people.length; pIdx++) {
          const person = people[pIdx];
          if (!person.name?.trim()) {
            onError(`القسم رقم (${secNum}): يرجى إدخال اسم الشخص رقم (${pIdx + 1})!`);
            return false;
          }
        }
      }
    }
  }

  return true;
};

// Default values for new sections
const sectionDefaults: Record<PortfolioSection["type"], () => PortfolioSection> = {
  "hero-video": () => ({
    id: newId(),
    type: "hero-video",
    order: 0,
    videoUrl: "",
    posterUrl: "",
    showPlayButton: true,
  }),
  gallery: () => ({ id: newId(), type: "gallery", order: 0, layout: "grid", items: [] }),
  people: () => ({ id: newId(), type: "people", order: 0, heroImageUrl: "", people: [] }),
  text: () => ({ id: newId(), type: "text", order: 0, heading: { ar: "", en: "" }, body: { ar: "", en: "" } }),
};

export default function PortfolioAdminEditPage() {
  const { t } = useI18n();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isNew = id === "new";

  const { data, loading, error } = useAsync(
    () => (isNew ? Promise.resolve(null) : getPortfolioEvent(id)),
    [id]
  );

  const [form, setForm] = useState<PortfolioEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingLang, setEditingLang] = useState<"en" | "ar">("ar");

  useEffect(() => {
    if (isNew) {
      const navState = (location.state as any) || {};
      const rawTitle = navState.initialTitle;
      const initialTitleObj =
        typeof rawTitle === "object" && rawTitle !== null
          ? { en: rawTitle.en || "", ar: rawTitle.ar || "" }
          : { en: typeof rawTitle === "string" ? rawTitle : "", ar: "" };
  
      setForm({
        id: "",
        title: initialTitleObj,
        slug: navState.initialSlug || `event-${Date.now()}`,
        cover_image_url: "",
        company_logo_url: "",
        client_logo_url: "",
        behind_the_scenes: false,
        published: false,
        order: 0,
        sections: [],
      } as PortfolioEvent);
    } else if (data) {
      const titleObj =
        typeof data.title === "object" && data.title !== null
          ? { en: data.title.en || "", ar: data.title.ar || "" }
          : { en: typeof data.title === "string" ? data.title : "", ar: "" };
  
      const formattedSections = (data.sections || []).map((sec: any) => {
        // 1. استخراج الـ media المباشرة أو من داخل sec.data
        const mediaList = sec.media?.length ? sec.media : sec.data?.media || [];
  
        // 2. دمج وتعريف mergedSection أولاً
        const { data: sectionData, ...restSection } = sec;
        const mergedSection = {
          ...restSection,
          ...(sectionData || {}),
        };
  
        // 3. تحويل وتجهيز قسم الـ People (معالجة gallery الخاصة بكل شخص)
        if (sec.type === "people") {
          const rawPeople = sec.people?.length ? sec.people : sec.data?.people || [];
          const formattedPeople = rawPeople.map((person: any) => ({
            ...person,
            gallery: (person.gallery || []).map((item: any) => ({
              id: item.id || (typeof newId === "function" ? newId() : Date.now() + Math.random()),
              type: item.media_type || item.type || "image",
              url: item.url || "",
              caption:
                typeof item.caption === "object"
                  ? item.caption
                  : { ar: item.caption || "", en: item.caption || "" },
              order: item.order ?? 0,
            })),
          }));
  
          return {
            ...mergedSection,
            people: formattedPeople,
          };
        }
  
        // 4. تحويل وتجهيز قسم الـ Gallery تحديداً
        if (sec.type === "gallery") {
          return {
            ...mergedSection,
            layout: sectionData?.layout || sec.layout || "grid",
            // تحويل مصفوفة media القادمة من الـ API إلى items التي يتوقعها مكون الـ Gallery
            items: mediaList.map((item: any) => ({
              id: item.id || (typeof newId === "function" ? newId() : Date.now() + Math.random()),
              type: item.media_type || item.type || "image",
              url: item.url || "",
              caption:
                typeof item.caption === "object"
                  ? item.caption
                  : { ar: item.caption || "", en: item.caption || "" },
              order: item.order ?? 0,
            })),
          };
        }
  
        return mergedSection;
      });
  
      setForm({
        ...data,
        title: titleObj,
        cover_image_url: data.cover_image_url || "",
        company_logo_url: data.company_logo_url || "",
        client_logo_url: data.client_logo_url || "",
        behind_the_scenes: Boolean(data.behind_the_scenes),
        sections: formattedSections,
      });
    }
  }, [data, isNew, location.state]);
  
  async function onSave() {
    if (!form) return;
    setErrorMessage("");
  
    const isValid = validatePortfolioForm(form, (msg) => {
      setErrorMessage(msg);
      alert(msg);
    });
  
    if (!isValid) return;
  
    setSaving(true);
  
    // تجهيز الـ Sections وتحويل items للـ Gallery والـ People إلى media/gallery للسيرفر
    const formattedSectionsForPayload = (form.sections || []).map((sec: any) => {
      if (sec.type === "people") {
        return {
          ...sec,
          people: (sec.people || []).map((person: any) => ({
            ...person,
            gallery: (person.gallery || []).map((item: any) => ({
              id: typeof item.id === "number" ? item.id : undefined,
              media_type: item.type || item.media_type || "image",
              url: item.url || "",
              caption: item.caption || { ar: "", en: "" },
              order: item.order ?? 0,
            })),
          })),
        };
      }
  
      if (sec.type === "gallery") {
        const galleryItems = sec.items || sec.media || [];
        return {
          ...sec,
          media: galleryItems.map((item: any) => ({
            id: typeof item.id === "number" ? item.id : undefined,
            media_type: item.type || item.media_type || "image",
            url: item.url || "",
            caption: item.caption || { ar: "", en: "" },
            order: item.order ?? 0,
          })),
        };
      }
      return sec;
    });
  
    const payload = {
      ...form,
      sections: formattedSectionsForPayload,
    };
  
    try {
      if (isNew) {
        const created = await createPortfolioEvent({
          title: payload.title,
          slug: payload.slug,
          cover_image_url: payload.cover_image_url,
          company_logo_url: payload.company_logo_url,
          client_logo_url: payload.client_logo_url,
          behind_the_scenes: payload.behind_the_scenes,
          published: payload.published,
          sections: payload.sections,
        } as any);
  
        setSaved(true);
        setTimeout(() => navigate(`/admin/portfolio/${created.id}`), 800);
      } else {
        await updatePortfolioEvent(payload.id, payload as any);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "حدث خطأ أثناء إرسال البيانات إلى السيرفر"
      );
    } finally {
      setSaving(false);
    }
  }

  function addSection(type: PortfolioSection["type"]) {
    if (!form) return;
    const section = { ...sectionDefaults[type](), order: form.sections.length };
    setForm({ ...form, sections: [...form.sections, section] });
    setExpandedId(section.id);
  }

  function updateSection(updated: PortfolioSection) {
    if (!form) return;
    setForm({
      ...form,
      sections: form.sections.map((s) => (s.id === updated.id ? updated : s)),
    });
  }

  function removeSection(sectionId: string) {
    if (!form) return;
    setForm({ ...form, sections: form.sections.filter((s) => s.id !== sectionId) });
  }

  function reorderSections(orderedIds: string[]) {
    if (!form) return;
    const byId = new Map(form.sections.map((s) => [s.id, s]));
    const reordered = orderedIds
      .map((sid) => byId.get(sid))
      .filter(Boolean) as PortfolioSection[];
    setForm({ ...form, sections: reordered.map((s, i) => ({ ...s, order: i })) });
  }

  if (!isNew && loading) return <LoadingState />;
  if (!isNew && error) return <ErrorState message={error} />;
  if (!form) return null;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/admin/portfolio")}
        className="text-sm text-on-surface-variant hover:text-primary mb-6"
      >
        ← {t.admin.portfolioModule}
      </button>

      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="font-display text-headline-md text-on-surface truncate">
          {isNew
            ? `Create: ${form?.title?.en || form?.title?.ar || ""}`
            : form?.title?.[editingLang] || form?.title?.en || form?.title?.ar || ""}
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded bg-error/10 text-error text-sm">
          {errorMessage}
        </div>
      )}

      {/* Event metadata */}
      <div className="glass rounded-xl p-6 md:p-8 flex flex-col gap-6 mb-10">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={editingLang === "en" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setEditingLang("en")}
          >
            English
          </Button>
          <Button
            type="button"
            variant={editingLang === "ar" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setEditingLang("ar")}
          >
            العربية
          </Button>
        </div>

        <Field label={`Title (${editingLang.toUpperCase()})`} htmlFor="evt-title">
          <Input
            id="evt-title"
            dir={editingLang === "ar" ? "rtl" : "ltr"}
            value={form.title?.[editingLang] ?? ""}
            onChange={(e) => {
              const newTitleValue = e.target.value;

              const updatedTitle = {
                en: form.title?.en ?? "",
                ar: form.title?.ar ?? "",
                [editingLang]: newTitleValue,
              };

              setForm({
                ...form,
                title: updatedTitle,
                slug: generateUniqueSlug(updatedTitle.en),
              });
            }}
          />
        </Field>

        <Field label="Slug" htmlFor="evt-slug" hint="Generated automatically from title">
          <Input
            id="evt-slug"
            value={form.slug}
            readOnly
            disabled
            className="opacity-70 cursor-not-allowed"
          />
        </Field>

        <Field label="Cover image" htmlFor="evt-cover">
          <MediaUploader
            value={form.cover_image_url}
            onChange={(url) => setForm({ ...form, cover_image_url: url })}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Company logo" htmlFor="evt-company-logo">
            <MediaUploader
              value={form.company_logo_url ?? ""}
              onChange={(url) => setForm({ ...form, company_logo_url: url })}
            />
          </Field>
          <Field label="Client logo" htmlFor="evt-client-logo">
            <MediaUploader
              value={form.client_logo_url ?? ""}
              onChange={(url) => setForm({ ...form, client_logo_url: url })}
            />
          </Field>
        </div>
        <div className="flex items-center gap-8">
          <Checkbox
            id="evt-bts"
            label="Behind The Scenes"
            checked={form.behind_the_scenes}
            onChange={(checked) => setForm({ ...form, behind_the_scenes: checked })}
          />
          <Checkbox
            id="evt-published"
            label={t.common.published}
            checked={form.published}
            onChange={(checked) => setForm({ ...form, published: checked })}
          />
        </div>
      </div>

      {/* Sections builder */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-on-surface">Sections</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => addSection("hero-video")}>
            + Hero video
          </Button>
          <Button variant="secondary" size="sm" onClick={() => addSection("gallery")}>
            + Gallery
          </Button>
          <Button variant="secondary" size="sm" onClick={() => addSection("people")}>
            + Featured people
          </Button>
          <Button variant="secondary" size="sm" onClick={() => addSection("text")}>
            + Text
          </Button>
        </div>
      </div>

      <ReorderList
        items={[...form.sections].sort((a, b) => a.order - b.order)}
        onReorder={reorderSections}
        renderItem={(section) => (
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>
              <Badge>{section.type}</Badge>
              <button
                className="flex-1 text-start text-on-surface font-medium"
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
              >
                {sectionLabel(section)}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
              >
                {expandedId === section.id ? "Collapse" : "Expand"}
              </Button>
              <Button variant="danger" size="sm" onClick={() => removeSection(section.id)}>
                {t.common.delete}
              </Button>
            </div>
            {expandedId === section.id && (
              <div className="mt-5 pt-5 border-t border-glass-border">
                <PortfolioSectionEditor section={section} onChange={updateSection} />
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}

function sectionLabel(section: any): string {
  switch (section?.type) {
    case "hero-video":
      return "Hero video";
    case "gallery": {
      const itemsCount = section?.items?.length ?? section?.data?.items?.length ?? 0;
      const layout = section?.layout ?? section?.data?.layout ?? "grid";
      return `Gallery (${itemsCount} items, ${layout})`;
    }
    case "people": {
      const peopleCount = section?.people?.length ?? section?.data?.people?.length ?? 0;
      return `Featured people (${peopleCount})`;
    }
    case "text": {
      const heading = section?.heading ?? section?.data?.heading;
      return heading?.ar || heading?.en || "Text block";
    }
    default:
      return "Section";
  }
}