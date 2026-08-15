import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import { getAdminTranslations, updateLanguageOverrides } from "../../services/endpoints/language";
import { en } from "../../i18n/en";
import { ar } from "../../i18n/ar";
import { Input, Textarea } from "../../components/ui/Form";
import { Button } from "../../components/ui/Button";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";

// ✅ تحويل كائن متداخل إلى مسارات مسطحة
function flatten(
  obj: any,
  prefix = ""
): Array<{ path: string; defaultEn: string; defaultAr: string }> {
  const entries: Array<{ path: string; defaultEn: string; defaultAr: string }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      const defaultEn = value;
      const defaultAr = getNestedValue(ar, path) || value;
      entries.push({ path, defaultEn, defaultAr });
    } else if (value && typeof value === "object") {
      entries.push(...flatten(value, path));
    }
  }

  return entries;
}

// ✅ الحصول على قيمة من كائن متداخل
function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return "";
    }
  }

  return typeof current === "string" ? current : "";
}

const allKeys = flatten(en);

export default function LanguageAdminPage() {
  const { t } = useI18n();

  // ✅ جلب الترجمات من API
  const { data, loading, error, refetch } = useAsync(() => getAdminTranslations(), []);

  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [overrides, setOverrides] = useState<{
    en: Record<string, string>;
    ar: Record<string, string>;
  }>({ en: {}, ar: {} });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ تعبئة overrides من البيانات
  useEffect(() => {
    if (data?.overrides) {
      setOverrides(data.overrides);
    }
  }, [data]);

  // ✅ حفظ التغييرات
  async function onSave() {
    setSaving(true);
    try {
      await updateLanguageOverrides(overrides);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await refetch();
      
      // ✅ إعادة تحميل لتطبيق التغييرات
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Failed to save translations:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ فلترة المفاتيح حسب البحث
  const filteredKeys = searchQuery
    ? allKeys.filter(
        ({ path, defaultEn, defaultAr }) =>
          path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          defaultEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          defaultAr.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allKeys;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-headline-md text-on-surface">
            {t.admin.languageModule}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Customize all translations • {allKeys.length} keys total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : t.common.save}
          </Button>
          {saved && (
            <span className="text-primary text-sm font-semibold">
              ✓ {t.common.saved}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 flex items-center gap-4">
        {/* Language Tabs */}
        <div className="flex gap-2">
          <Button
            variant={locale === "en" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setLocale("en")}
          >
            🇬🇧 English
          </Button>
          <Button
            variant={locale === "ar" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setLocale("ar")}
          >
            🇸🇦 العربية
          </Button>
        </div>

        {/* Search */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Translations Grid */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto pr-2">
          {filteredKeys.length === 0 && (
            <p className="text-center text-on-surface-variant py-8">
              No translations found
            </p>
          )}

          {filteredKeys.map(({ path, defaultEn, defaultAr }) => {
            const currentValue = overrides[locale][path] || "";
            const defaultValue = locale === "en" ? defaultEn : defaultAr;
            const hasCustomValue = currentValue && currentValue !== defaultValue;
            const isLongText = defaultValue.length > 50;

            return (
              <div
                key={path}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 pb-6 border-b border-glass-border last:border-0"
              >
                {/* Key Info */}
                <div className="flex flex-col gap-2">
                  <code className="text-xs font-mono text-primary font-semibold">
                    {path}
                  </code>
                  <div className="text-xs text-on-surface-variant/70 italic">
                    <div className="font-semibold mb-1">Default:</div>
                    <div dir={locale === "ar" ? "rtl" : "ltr"}>
                      {defaultValue}
                    </div>
                  </div>
                </div>

                {/* Input Field */}
                <div className="flex flex-col gap-2">
                  {isLongText ? (
                    <Textarea
                      placeholder={defaultValue}
                      value={currentValue}
                      onChange={(e) =>
                        setOverrides({
                          ...overrides,
                          [locale]: {
                            ...overrides[locale],
                            [path]: e.target.value,
                          },
                        })
                      }
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      rows={3}
                      className={
                        hasCustomValue
                          ? "border-primary bg-primary/5"
                          : ""
                      }
                    />
                  ) : (
                    <Input
                      placeholder={defaultValue}
                      value={currentValue}
                      onChange={(e) =>
                        setOverrides({
                          ...overrides,
                          [locale]: {
                            ...overrides[locale],
                            [path]: e.target.value,
                          },
                        })
                      }
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      className={
                        hasCustomValue
                          ? "border-primary bg-primary/5"
                          : ""
                      }
                    />
                  )}

                  {/* Status */}
                  {hasCustomValue && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-primary font-semibold">
                        ✓ Custom value
                      </span>
                      <button
                        onClick={() =>
                          setOverrides({
                            ...overrides,
                            [locale]: {
                              ...overrides[locale],
                              [path]: "",
                            },
                          })
                        }
                        className="text-xs text-error hover:underline"
                      >
                        Reset to default
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 rounded-lg bg-surface-container-high/50 border border-outline-variant">
        <p className="text-sm text-on-surface-variant">
          💡 <strong>Tip:</strong> Leave fields empty to use default translations. 
          Showing {filteredKeys.length} of {allKeys.length} translations.
        </p>
      </div>
    </div>
  );
}