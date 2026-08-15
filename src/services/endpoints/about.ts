import { request } from "../apiClient";
import type { AboutContent } from "../types";

const bgStyleToApi: Record<AboutContent["backgroundVariant"], number> = {
  lightfall: 1,
  prism: 2,
  none: 3,
};

const bgStyleFromApi: Record<number, AboutContent["backgroundVariant"]> = {
  1: "lightfall",
  2: "prism",
  3: "none",
};

export async function getAbout(): Promise<AboutContent> {
  const res = await request<{ data: any }>({
    url: "/public/about",
    method: "GET",
  });

  const data = res.data || {};

  // تحويل القيمة القادمة إلى رقم بشكل صريح ودقيق
  const rawBgStyle = Number(data.background_style ?? data.backgroundVariant ?? 1);
  const mappedVariant = bgStyleFromApi[rawBgStyle] || "lightfall";

  return {
    title: {
      en: data.title?.en || "",
      ar: data.title?.ar || "",
    },
    description: {
      en: data.description?.en || "",
      ar: data.description?.ar || "",
    },
    imageUrl: data.image || data.image_url || "",
    backgroundVariant: mappedVariant,
  };
}

export async function updateAbout(content: AboutContent): Promise<AboutContent> {
  const payload = {
    title: {
      en: content.title.en,
      ar: content.title.ar,
    },
    description: {
      en: content.description.en,
      ar: content.description.ar,
    },
    // قراءة رابط الصورة بالشكل الصحيح
    image_url: content.imageUrl || null,
    // تحويل نمط الخلفية النصي لعدد صحيح يقبله Laravel
    background_style: bgStyleToApi[content.backgroundVariant] ?? 1,
  };

  const res = await request<{ data: any }>({
    url: "/admin/about",
    method: "POST",
    data: payload,
  });

  const data = res.data || {};

  return {
    title: {
      en: data.title?.en || content.title.en,
      ar: data.title?.ar || content.title.ar,
    },
    description: {
      en: data.description?.en || content.description.en,
      ar: data.description?.ar || content.description.ar,
    },
    imageUrl: data.image || data.image_url || content.imageUrl || "",
    backgroundVariant: bgStyleFromApi[data.background_style] || content.backgroundVariant,
  };
}