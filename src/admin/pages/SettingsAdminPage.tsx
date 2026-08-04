import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getGeneralSettings, updateGeneralSettings } from "../../services/endpoints/settings";
import type { GeneralSettings } from "../../services/types";
import { Field, Input, Select, Checkbox } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/AsyncStates";

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
        <Field label="Site name" htmlFor="settings-name">
          <Input
            id="settings-name"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
        </Field>
        <Field label="Default language" htmlFor="settings-locale">
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
        <Checkbox
          id="settings-maintenance"
          label="Maintenance mode"
          checked={form.maintenanceMode}
          onChange={(checked) => setForm({ ...form, maintenanceMode: checked })}
        />
        <div className="flex items-center gap-4">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
        </div>
      </div>
    </div>
  );
}
