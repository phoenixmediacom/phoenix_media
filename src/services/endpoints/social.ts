import {
  seed,
  listCollection,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  newId,
} from "../localStore";
import { request } from "../apiClient";
import type { SocialLink } from "../types";

const KEY = "social";

seed<SocialLink[]>(KEY, [
  { id: "soc-1", platform: "instagram", url: "https://instagram.com/phoenixmedia", order: 0 },
  { id: "soc-2", platform: "behance", url: "https://behance.net/phoenixmedia", order: 1 },
  { id: "soc-3", platform: "vimeo", url: "https://vimeo.com/phoenixmedia", order: 2 },
  { id: "soc-4", platform: "x", url: "https://x.com/phoenixmedia", order: 3 },
]);

export async function listSocialLinks(): Promise<SocialLink[]> {
  return request({
    method: "GET",
    run: async () => {
      const { items } = await listCollection<SocialLink>(KEY);
      return [...items].sort((a, b) => a.order - b.order);
    },
  });
}

export async function createSocialLink(
  input: Omit<SocialLink, "id" | "order">,
): Promise<SocialLink> {
  return request({
    method: "POST",
    requiresAuth: true,
    run: async () => {
      const { items } = await listCollection<SocialLink>(KEY);
      return createItem<SocialLink>(KEY, { ...input, id: newId(), order: items.length });
    },
  });
}

export async function updateSocialLink(
  id: string,
  patch: Partial<SocialLink>,
): Promise<SocialLink> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: () => updateItem<SocialLink>(KEY, id, patch),
  });
}

export async function deleteSocialLink(id: string): Promise<void> {
  return request({
    method: "DELETE",
    requiresAuth: true,
    run: () => deleteItem<SocialLink>(KEY, id),
  });
}

export async function reorderSocialLinks(orderedIds: string[]): Promise<SocialLink[]> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: async () => {
      const reordered = await reorderItems<SocialLink>(KEY, orderedIds);
      return Promise.all(
        reordered.map((item, index) => updateItem<SocialLink>(KEY, item.id, { order: index })),
      );
    },
  });
}
