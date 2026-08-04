import { seed, getDoc, setDoc } from "../localStore";
import { request } from "../apiClient";
import type { SeoSettings } from "../types";

const KEY = "seo";

seed<SeoSettings>(KEY, {
  pageTitle: "Phoenix Media — Cinematic Production House",
  metaDescription:
    "Phoenix Media is a cinematic production house specializing in commercials, documentaries, and large-scale live event coverage.",
  ogImageUrl: "",
});

export async function getSeoSettings(): Promise<SeoSettings> {
  return request({ method: "GET", run: () => getDoc<SeoSettings>(KEY) });
}

export async function updateSeoSettings(settings: SeoSettings): Promise<SeoSettings> {
  return request({
    method: "PUT",
    requiresAuth: true,
    run: () => setDoc(KEY, settings),
  });
}
