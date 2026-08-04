import { seed, getDoc, setDoc } from "../localStore";
import { request } from "../apiClient";
import type { GeneralSettings } from "../types";

const KEY = "settings:general";

seed<GeneralSettings>(KEY, {
  siteName: "Phoenix Media",
  defaultLocale: "en",
  maintenanceMode: false,
});

export async function getGeneralSettings(): Promise<GeneralSettings> {
  return request({ method: "GET", run: () => getDoc<GeneralSettings>(KEY) });
}

export async function updateGeneralSettings(
  settings: GeneralSettings,
): Promise<GeneralSettings> {
  return request({
    method: "PUT",
    requiresAuth: true,
    run: () => setDoc(KEY, settings),
  });
}
