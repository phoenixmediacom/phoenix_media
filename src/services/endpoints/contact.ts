import { seed, getDoc, setDoc, createItem, newId, listCollection } from "../localStore";
import { request } from "../apiClient";
import type { ContactInfo, ContactSubmission } from "../types";

const INFO_KEY = "contact:info";
const SUBMISSIONS_KEY = "contact:submissions";

seed<ContactInfo>(INFO_KEY, {
  email: "info@phoenixmedia.com",
  phone: "+966 50 123 4567",
  address: "Jeddah, Saudi Arabia",
  whatsapp: "+966501234567",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3711.87!2d39.198!3d21.543",
});
seed<ContactSubmission[]>(SUBMISSIONS_KEY, []);

export async function getContactInfo(): Promise<ContactInfo> {
  return request({ method: "GET", run: () => getDoc<ContactInfo>(INFO_KEY) });
}

export async function updateContactInfo(info: ContactInfo): Promise<ContactInfo> {
  return request({
    method: "PUT",
    requiresAuth: true,
    run: () => setDoc(INFO_KEY, info),
  });
}

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
  return request({
    method: "GET",
    requiresAuth: true,
    run: async () => {
      const { items } = await listCollection<ContactSubmission>(SUBMISSIONS_KEY);
      return [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
  });
}

export async function submitContactForm(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactSubmission> {
  return request({
    method: "POST",
    run: () =>
      createItem<ContactSubmission>(SUBMISSIONS_KEY, {
        id: newId(),
        ...input,
        createdAt: new Date().toISOString(),
      }),
  });
}
