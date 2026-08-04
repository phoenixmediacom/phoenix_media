import type { PortfolioSection, FeaturedPerson } from "../../services/types";
import { Field, Input, Select, Textarea, Checkbox } from "../../components/ui/Form";
import { MediaUploader } from "../../components/ui/MediaUploader";
import { Button } from "../../components/ui/Button";
import { GalleryItemsEditor } from "./GalleryItemsEditor";

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PortfolioSectionEditor({
  section,
  onChange,
}: {
  section: PortfolioSection;
  onChange: (section: PortfolioSection) => void;
}) {
  if (section.type === "hero-video") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Video file / URL" htmlFor={`video-${section.id}`}>
          <MediaUploader
            accept="video/*"
            value={section.videoUrl}
            onChange={(url) => onChange({ ...section, videoUrl: url })}
          />
        </Field>
        <Field label="Poster image" htmlFor={`poster-${section.id}`}>
          <MediaUploader
            value={section.posterUrl}
            onChange={(url) => onChange({ ...section, posterUrl: url })}
          />
        </Field>
        <Checkbox
          id={`play-${section.id}`}
          label="Show play button overlay"
          checked={section.showPlayButton}
          onChange={(checked) => onChange({ ...section, showPlayButton: checked })}
        />
      </div>
    );
  }

  if (section.type === "gallery") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Layout" htmlFor={`layout-${section.id}`}>
          <Select
            id={`layout-${section.id}`}
            value={section.layout}
            onChange={(e) =>
              onChange({ ...section, layout: e.target.value as "grid" | "masonry" })
            }
          >
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
          </Select>
        </Field>
        <GalleryItemsEditor
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
        />
      </div>
    );
  }

  if (section.type === "text") {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Heading" htmlFor={`heading-${section.id}`}>
          <Input
            id={`heading-${section.id}`}
            value={section.heading}
            onChange={(e) => onChange({ ...section, heading: e.target.value })}
          />
        </Field>
        <Field label="Body" htmlFor={`body-${section.id}`}>
          <Textarea
            id={`body-${section.id}`}
            value={section.body}
            onChange={(e) => onChange({ ...section, body: e.target.value })}
          />
        </Field>
      </div>
    );
  }

  if (section.type === "people") {
    const peopleSection = section as Extract<PortfolioSection, { type: "people" }>;
    function updatePerson(id: string, patch: Partial<FeaturedPerson>) {
      onChange({
        ...peopleSection,
        people: peopleSection.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      });
    }
    function removePerson(id: string) {
      onChange({ ...peopleSection, people: peopleSection.people.filter((p) => p.id !== id) });
    }
    function addPerson() {
      onChange({
        ...peopleSection,
        people: [
          ...peopleSection.people,
          { id: newId(), name: "", photoUrl: "", order: peopleSection.people.length, gallery: [] },
        ],
      });
    }

    return (
      <div className="flex flex-col gap-6">
        <Field label="Hero background image" htmlFor={`people-hero-${peopleSection.id}`}>
          <MediaUploader
            value={peopleSection.heroImageUrl}
            onChange={(url) => onChange({ ...peopleSection, heroImageUrl: url })}
          />
        </Field>

        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-on-surface-variant">Featured people</span>
          {peopleSection.people.map((person) => (
            <div key={person.id} className="glass rounded-lg p-4 flex flex-col gap-3">
              <div className="grid grid-cols-[80px_1fr_auto] gap-3 items-start">
                <MediaUploader
                  value={person.photoUrl}
                  onChange={(url) => updatePerson(person.id, { photoUrl: url })}
                />
                <Input
                  placeholder="Name"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                />
                <Button variant="danger" size="sm" onClick={() => removePerson(person.id)}>
                  ✕
                </Button>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant/70 block mb-2">
                  Gallery opened when this person is clicked
                </span>
                <GalleryItemsEditor
                  items={person.gallery}
                  onChange={(gallery) => updatePerson(person.id, { gallery })}
                />
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addPerson} className="self-start">
            + Add person
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
