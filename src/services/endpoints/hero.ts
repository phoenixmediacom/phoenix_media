import { seed, getDoc, setDoc } from "../localStore";
import { request } from "../apiClient";
import type { HeroContent } from "../types";

const KEY = "hero";

seed<HeroContent>(KEY, {
  companyName: "Phoenix Media",
  tagline: "Cinematic Production House",
  logoUrl: "/logo.png",
  video: {
    type: "youtube",
    url: "https://youtu.be/6eWW-PJBV0w?si=XUCq6kgNFQvqZhUm",
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
