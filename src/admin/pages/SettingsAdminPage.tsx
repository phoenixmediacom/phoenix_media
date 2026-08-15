import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getGeneralSettings, updateGeneralSettings } from "../../services/endpoints/settings";
import type { GeneralSettings } from "../../services/types";
import { Field, Input, Select, Checkbox } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/AsyncStates";
import { MediaUploader } from "../../components/ui/MediaUploader";

export default function SettingsAdminPage() {
  const { t } = useI18n();
  const { data, loading } = useAsync(() => getGeneralSettings(), []);
  const [form, setForm] = useState<GeneralSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    await updateGeneralSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !form) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-headline-md text-on-surface mb-8">
        {t.admin.settingsModule}
      </h1>

      <div className="flex flex-col gap-6 glass rounded-xl p-6 md:p-8">
        {/* Site Name */}
        <Field label="Site Name" htmlFor="settings-name">
          <Input
            id="settings-name"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
        </Field>

        {/* Browser Tab Title */}
        <Field label="Browser Tab Title" htmlFor="settings-browser-title">
          <Input
            id="settings-browser-title"
            value={form.browserTabTitle}
            onChange={(e) => setForm({ ...form, browserTabTitle: e.target.value })}
          />
        </Field>

        {/* Favicon / Icon Input & Uploader */}
        <Field label="Favicon / Icon" htmlFor="settings-favicon">
          <div className="flex flex-col gap-3">
            <Input
              id="settings-favicon"
              placeholder="https://... or upload icon below"
              value={form.favicon}
              onChange={(e) => setForm({ ...form, favicon: e.target.value })}
            />

            {/* MediaUploader Component */}
            <MediaUploader
              value={form.favicon}
              onChange={(url) => setForm({ ...form, favicon: url })}
              accept="image/*"
            />
          </div>
        </Field>

        {/* Default Language */}
        <Field label="Default Language" htmlFor="settings-locale">
          <Select
            id="settings-locale"
            value={form.defaultLocale}
            onChange={(e) =>
              setForm({ ...form, defaultLocale: e.target.value as "en" | "ar" })
            }
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </Select>
        </Field>

        {/* Maintenance Mode */}
        <Checkbox
          id="settings-maintenance"
          label="Maintenance Mode"
          checked={form.maintenanceMode}
          onChange={(checked) => setForm({ ...form, maintenanceMode: checked })}
        />

        {/* Save Bar */}
        <div className="flex items-center gap-4 pt-2">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
        </div>
      </div>
    </div>
  );
}