import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getLanguageOverrides, updateLanguageOverrides } from "../../services/endpoints/language";
import { en } from "../../i18n/en";
import { Input } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/AsyncStates";

function flatten(obj: object, prefix = ""): Array<{ path: string; defaultValue: string }> {
  const entries: Array<{ path: string; defaultValue: string }> = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") entries.push({ path, defaultValue: value });
    else if (typeof value === "object" && value !== null) entries.push(...flatten(value, path));
  }
  return entries;
}

const allKeys = flatten(en);

export default function LanguageAdminPage() {
  const { t } = useI18n();
  const { data, loading } = useAsync(() => getLanguageOverrides(), []);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [overrides, setOverrides] = useState<{ en: Record<string, string>; ar: Record<string, string> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setOverrides(data);
  }, [data]);

  async function onSave() {
    if (!overrides) return;
    setSaving(true);
    await updateLanguageOverrides(overrides);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // The public site's i18n provider only loads overrides once on mount;
    // reload so the change is visible immediately in this session too.
    window.location.reload();
  }

  if (loading || !overrides) return <LoadingState />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-headline-md text-on-surface">
          {t.admin.languageModule}
        </h1>
        <div className="flex items-center gap-3">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "…" : t.common.save}
          </Button>
          {saved && <span className="text-primary text-sm">{t.common.saved}</span>}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button variant={locale === "en" ? "primary" : "secondary"} size="sm" onClick={() => setLocale("en")}>
          English
        </Button>
        <Button variant={locale === "ar" ? "primary" : "secondary"} size="sm" onClick={() => setLocale("ar")}>
          العربية
        </Button>
      </div>

      <div className="glass rounded-xl p-6 md:p-8 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        {allKeys.map(({ path, defaultValue }) => (
          <div key={path} className="grid grid-cols-[220px_1fr] gap-4 items-center">
            <span className="font-mono-label text-xs text-on-surface-variant truncate" title={path}>
              {path}
            </span>
            <Input
              placeholder={defaultValue}
              value={overrides[locale][path] ?? ""}
              onChange={(e) =>
                setOverrides({
                  ...overrides,
                  [locale]: { ...overrides[locale], [path]: e.target.value },
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
