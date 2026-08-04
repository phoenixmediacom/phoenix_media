import { seed, getDoc, setDoc } from "../localStore";
import { request } from "../apiClient";
import type { LanguageOverrides } from "../types";

const KEY = "language:overrides";

seed<LanguageOverrides>(KEY, { en: {}, ar: {} });

export async function getLanguageOverrides(): Promise<LanguageOverrides> {
  return request({ method: "GET", run: () => getDoc<LanguageOverrides>(KEY) });
}

export async function updateLanguageOverrides(
  overrides: LanguageOverrides,
): Promise<LanguageOverrides> {
  return request({
    method: "PUT",
    requiresAuth: true,
    run: () => setDoc(KEY, overrides),
  });
}
