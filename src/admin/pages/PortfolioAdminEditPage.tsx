import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getPortfolioEvent, updatePortfolioEvent } from "../../services/endpoints/portfolio";
import type { PortfolioEvent, PortfolioSection } from "../../services/types";
import { Field, Input, Checkbox } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Card";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import { PortfolioSectionEditor } from "../components/PortfolioSectionEditor";

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

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
  text: () => ({ id: newId(), type: "text", order: 0, heading: "", body: "" }),
};

export default function PortfolioAdminEditPage() {
  const { t } = useI18n();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => getPortfolioEvent(id), [id]);
  const [form, setForm] = useState<PortfolioEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    await updatePortfolioEvent(form.id, form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  if (loading || !form) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/admin/portfolio")}
        className="text-sm text-on-surface-variant hover:text-primary mb-6"
      >
        ← {t.admin.portfolioModule}
      </button>

      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="font-display text-headline-md text-on-surface truncate">{form.title}</h1>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
        </div>
      </div>

      {/* Event metadata */}
      <div className="glass rounded-xl p-6 md:p-8 flex flex-col gap-6 mb-10">
        <Field label="Title" htmlFor="evt-title">
          <Input
            id="evt-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field label="Slug" htmlFor="evt-slug" hint="Used in the public URL: /portfolio/your-slug">
          <Input
            id="evt-slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>
        <Field label="Cover image" htmlFor="evt-cover">
          <MediaUploader
            value={form.coverImageUrl}
            onChange={(url) => setForm({ ...form, coverImageUrl: url })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Company logo" htmlFor="evt-company-logo">
            <MediaUploader
              value={form.companyLogoUrl ?? ""}
              onChange={(url) => setForm({ ...form, companyLogoUrl: url })}
            />
          </Field>
          <Field label="Client logo" htmlFor="evt-client-logo">
            <MediaUploader
              value={form.clientLogoUrl ?? ""}
              onChange={(url) => setForm({ ...form, clientLogoUrl: url })}
            />
          </Field>
        </div>
        <div className="flex items-center gap-8">
          <Checkbox
            id="evt-bts"
            label="Behind The Scenes"
            checked={form.behindTheScenes}
            onChange={(checked) => setForm({ ...form, behindTheScenes: checked })}
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

function sectionLabel(section: PortfolioSection): string {
  switch (section.type) {
    case "hero-video":
      return "Hero video";
    case "gallery":
      return `Gallery (${section.items.length} items, ${section.layout})`;
    case "people":
      return `Featured people (${section.people.length})`;
    case "text":
      return section.heading || "Text block";
  }
}
