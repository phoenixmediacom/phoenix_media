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
import type { LogoItem } from "../types";

export function createLogoCollectionEndpoints(key: string, initial: LogoItem[]) {
  seed<LogoItem[]>(key, initial);

  return {
    async list(search = ""): Promise<LogoItem[]> {
      return request({
        method: "GET",
        run: async () => {
          const { items } = await listCollection<LogoItem>(key, {
            search,
            searchFields: ["name"],
          });
          return [...items].sort((a, b) => a.order - b.order);
        },
      });
    },
    async create(input: Omit<LogoItem, "id" | "order">): Promise<LogoItem> {
      return request({
        method: "POST",
        requiresAuth: true,
        run: async () => {
          const { items } = await listCollection<LogoItem>(key);
          const order = items.length;
          return createItem<LogoItem>(key, { ...input, id: newId(), order });
        },
      });
    },
    async update(id: string, patch: Partial<LogoItem>): Promise<LogoItem> {
      return request({
        method: "PATCH",
        requiresAuth: true,
        run: () => updateItem<LogoItem>(key, id, patch),
      });
    },
    async remove(id: string): Promise<void> {
      return request({
        method: "DELETE",
        requiresAuth: true,
        run: () => deleteItem<LogoItem>(key, id),
      });
    },
    async reorder(orderedIds: string[]): Promise<LogoItem[]> {
      return request({
        method: "PATCH",
        requiresAuth: true,
        run: async () => {
          const reordered = await reorderItems<LogoItem>(key, orderedIds);
          return Promise.all(
            reordered.map((item, index) => updateItem<LogoItem>(key, item.id, { order: index })),
          );
        },
      });
    },
  };
}
