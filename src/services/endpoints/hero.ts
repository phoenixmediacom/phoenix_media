import { seed, getDoc, setDoc } from "../localStore";
import { request } from "../apiClient";
import type { HeroContent } from "../types";

const KEY = "hero";

seed<HeroContent>(KEY, {
  companyName: "Phoenix Media",
  tagline: "Cinematic Production House",
  logoUrl: "/phoenix-logo.svg",
  video: {
    type: "upload",
    url: "https://cdn.coverr.co/videos/coverr-a-cinema-camera-on-a-film-set-2632/1080p.mp4",
  },
});

export async function getHero(): Promise<HeroContent> {
  return request({ method: "GET", run: () => getDoc<HeroContent>(KEY) });
}

export async function updateHero(content: HeroContent): Promise<HeroContent> {
  return request({
    method: "PUT",
    requiresAuth: true,
    run: () => setDoc(KEY, content),
  });
}
