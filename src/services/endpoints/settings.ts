import api from "../apiClient";
import type { GeneralSettings } from "../types";

function mapSettingsFromApi(settings: any): GeneralSettings {
  return {
    siteName: settings?.site_name || "Phoenix Media",
    defaultLocale: settings?.default_language || "en",
    browserTabTitle: settings?.browser_tab_title || "",
    favicon: settings?.favicon || "",
    maintenanceMode: Boolean(settings?.maintenance_mode),
  };
}

// 1. الواجهة العامة (Public)
export async function getPublicSettings(): Promise<GeneralSettings> {
  try {
    const response = await api.get<{ data: any }>("/api/public/settings");
    return mapSettingsFromApi(response.data?.data || response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch public settings:", error);
    }
    throw error;
  }
}

// 2. لوحة التحكم (Admin)
export async function getGeneralSettings(): Promise<GeneralSettings> {
  try {
    const response = await api.get<{ data: any }>("/api/admin/settings");
    return mapSettingsFromApi(response.data?.data || response.data);
  } catch (error: any) {
    console.error("Failed to fetch general settings:", error);
    throw new Error(error.response?.data?.message || "فشل جلب الإعدادات العامة");
  }
}

export async function updateGeneralSettings(
  settings: GeneralSettings
): Promise<GeneralSettings> {
  try {
    const payload = {
      site_name: settings.siteName,
      default_language: settings.defaultLocale,
      browser_tab_title: settings.browserTabTitle,
      favicon: settings.favicon,
      maintenance_mode: settings.maintenanceMode,
    };

    const response = await api.post("/api/admin/settings", payload);
    return mapSettingsFromApi(response.data?.data || response.data);
  } catch (error: any) {
    console.error("Failed to update general settings:", error);
    throw new Error(error.response?.data?.message || "فشل تحديث الإعدادات العامة");
  }
}