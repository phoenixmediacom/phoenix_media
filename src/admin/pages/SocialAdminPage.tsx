import { useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import {
  listSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
} from "../../services/endpoints/social";
import type { SocialLink, SocialPlatform } from "../../services/types";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Form";
import { ReorderList } from "../../components/ui/ReorderList";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import { SocialIcon } from "../../components/layout/SocialIcon";

const platforms: SocialPlatform[] = [
  "instagram",
  "facebook",
  "x",
  "vimeo",
  "behance",
  "snapchat",
  "youtube",
  "tiktok",
  "linkedin",
  "whatsapp",
];

export default function SocialAdminPage() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useAsync(() => listSocialLinks(), []);
  const [modalItem, setModalItem] = useState<SocialLink | "new" | null>(null);
  const [draft, setDraft] = useState<{ platform: SocialPlatform; url: string }>({
    platform: "instagram",
    url: "",
  });

  function openNew() {
    setDraft({ platform: "instagram", url: "" });
    setModalItem("new");
  }
  function openEdit(item: SocialLink) {
    setDraft({ platform: item.platform, url: item.url });
    setModalItem(item);
  }
  async function onSave() {
    if (modalItem === "new") await createSocialLink(draft);
    else if (modalItem) await updateSocialLink(modalItem.id, draft);
    setModalItem(null);
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">{t.admin.socialModule}</h1>
        <Button onClick={openNew}>{t.common.add}</Button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <ReorderList
          items={data}
          onReorder={(ids) => reorderSocialLinks(ids).then(() => refetch())}
          renderItem={(item) => (
            <div className="flex items-center gap-4 glass rounded-lg p-4">
              <span className="text-on-surface-variant/50" aria-hidden="true">
                ⠿
              </span>
              <span className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
                <SocialIcon platform={item.platform} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface capitalize">{item.platform}</p>
                <p className="text-sm text-on-surface-variant truncate">{item.url}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                {t.common.edit}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteSocialLink(item.id).then(() => refetch())}
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
          <Field label="Platform" htmlFor="social-platform">
            <Select
              id="social-platform"
              value={draft.platform}
              onChange={(e) => setDraft({ ...draft, platform: e.target.value as SocialPlatform })}
            >
              {platforms.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="URL" htmlFor="social-url">
            <Input
              id="social-url"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            />
          </Field>
          <Button onClick={onSave}>{t.common.save}</Button>
        </div>
      </Modal>
    </div>
  );
}
