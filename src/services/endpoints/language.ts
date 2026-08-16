import { request } from "../apiClient";
import type { LanguageOverrides } from "../types";

export interface TranslationItem {
  id: number;
  key: string;
  value: {
    en: string;
    ar: string;
  };
  group: string;
}

/**
 * ✅ Public: Get all translations for merging with defaults
 */
export async function getLanguageOverrides(): Promise<LanguageOverrides> {
  const response = await request<{ data: TranslationItem[] }>({
    method: "GET",
    url: "/api/public/translations",
  });

  const items = response.data || [];
  const overrides: LanguageOverrides = { en: {}, ar: {} };

  items.forEach((item) => {
    overrides.en[item.key] = item.value?.en || "";
    overrides.ar[item.key] = item.value?.ar || "";
  });

  return overrides;
}

/**
 * ✅ Admin: Get all translations with full data
 */
export async function getAdminTranslations(): Promise<{
  translations: TranslationItem[];
  overrides: LanguageOverrides;
}> {
  const response = await request<{ data: TranslationItem[] }>({
    method: "GET",
    url: "/api/admin/translations",
  });

  const items = response.data || [];
  const overrides: LanguageOverrides = { en: {}, ar: {} };

  items.forEach((item) => {
    overrides.en[item.key] = item.value?.en || "";
    overrides.ar[item.key] = item.value?.ar || "";
  });

  return {
    translations: items,
    overrides,
  };
}

/**
 * ✅ Update single translation
 */
export async function updateTranslation(
  id: number,
  value: { en: string; ar: string }
): Promise<TranslationItem> {
  const response = await request<{ data: TranslationItem }>({
    method: "PUT",
    url: `/api/admin/translations/${id}`,
    data: { value },
  });

  return response.data;
}

/**
 * ✅ Admin: Bulk update translations
 */
export async function updateLanguageOverrides(
  overrides: LanguageOverrides
): Promise<void> {
  const { translations } = await getAdminTranslations();
  const keyToItemMap = new Map<string, TranslationItem>();

  translations.forEach((item) => keyToItemMap.set(item.key, item));

  const allKeys = Array.from(
    new Set([
      ...Object.keys(overrides.en),
      ...Object.keys(overrides.ar),
    ])
  );

  const updates: Promise<any>[] = [];

  for (const key of allKeys) {
    const enVal = overrides.en[key] ?? ""; // ✅ استخدام ?? بدلاً من ||
    const arVal = overrides.ar[key] ?? "";
    const existing = keyToItemMap.get(key);

    if (existing) {
      // ✅ التحديث دائماً (حتى لو كانت القيمة نفسها)
      updates.push(
        request({
          method: "PUT",
          url: `/admin/translations/${existing.id}`,
          data: {
            value: { en: enVal, ar: arVal },
          },
        })
      );
    } else if (enVal || arVal) {
      // ✅ إنشاء جديد
      updates.push(
        request({
          method: "POST",
          url: "/admin/translations",
          data: {
            key,
            value: { en: enVal, ar: arVal },
            group: key.split(".")[0] || "general",
          },
        })
      );
    }
  }

  // ✅ تنفيذ كل التحديثات
  await Promise.all(updates);
}