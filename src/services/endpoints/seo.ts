import { request } from "../apiClient";
import type { SeoSettings } from "../types";

function parseKeywords(rawKeywords: any): string[] {
  if (Array.isArray(rawKeywords)) return rawKeywords;
  if (typeof rawKeywords === "string") {
    try {
      const parsed = JSON.parse(rawKeywords);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    }
  }
  return [];
}

function mapSeoFromApi(data: any): SeoSettings {
  return {
    pageTitle: data?.page_title ?? "",
    metaDescription: data?.meta_description ?? "",
    keywords: parseKeywords(data?.keywords),
    ogImageUrl: data?.social_share_image ?? "",
    ogImageType: data?.social_share_image_type ?? "url",
  };
}

// 1. الواجهة العامة (Public)
export async function getPublicSeoSettings(): Promise<SeoSettings> {
  return request({
    url: "/public/seo",
    method: "GET",
  }).then((res: any) => mapSeoFromApi(res.data || res));
}

// دالة متوافقة مع SeoHead.tsx
export const getSeoSettings = getPublicSeoSettings;

// 2. لوحة التحكم (Admin)
export async function getAdminSeoSettings(): Promise<SeoSettings> {
  return request({
    url: "/admin/seo",
    method: "GET",
  }).then((res: any) => mapSeoFromApi(res.data || res));
}

export async function updateSeoSettings(settings: SeoSettings): Promise<SeoSettings> {
  const payload = {
    page_title: settings.pageTitle,
    meta_description: settings.metaDescription,
    keywords: settings.keywords,
    social_share_image: settings.ogImageUrl,
    social_share_image_type: "url",
  };

  return request({
    url: "/admin/seo",
    method: "POST",
    data: payload,
  }).then((res: any) => mapSeoFromApi(res.data || res));
}