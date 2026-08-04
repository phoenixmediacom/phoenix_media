import { seed, getDoc, setDoc } from "../localStore";
import { request } from "../apiClient";
import type { AboutContent } from "../types";

const KEY = "about";

seed<AboutContent>(KEY, {
  title: { en: "About Us", ar: "من نحن" },
  description: {
    en: "We are a team of specialized cinematographers, directors, and editors with 7+ years of experience producing commercials, documentaries, and large-scale live event coverage. From briefing and storyboarding to shooting and delivery, we handle every stage of production in-house.",
    ar: "نحن فريق متخصص من مديري التصوير والمخرجين والمونتيرين بخبرة تتجاوز 7 سنوات في إنتاج الإعلانات والأفلام الوثائقية وتغطية الفعاليات الحية الكبرى. من الإحاطة والتخطيط القصصي إلى التصوير والتسليم، ندير كل مرحلة من مراحل الإنتاج داخليًا.",
  },
  imageUrl:
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
  backgroundVariant: "lightfall",
});

export async function getAbout(): Promise<AboutContent> {
  return request({ method: "GET", run: () => getDoc<AboutContent>(KEY) });
}

export async function updateAbout(content: AboutContent): Promise<AboutContent> {
  return request({
    method: "PUT",
    requiresAuth: true,
    run: () => setDoc(KEY, content),
  });
}
