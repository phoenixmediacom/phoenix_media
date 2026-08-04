import {
  seed,
  listCollection,
  updateItem,
  reorderItems,
} from "../localStore";
import { request } from "../apiClient";
import type { NavItem } from "../types";

const KEY = "navigation";

seed<NavItem[]>(KEY, [
  { id: "nav-home", labelKey: "nav.home", targetId: "hero", order: 0, visible: true },
  { id: "nav-about", labelKey: "nav.about", targetId: "about", order: 1, visible: true },
  { id: "nav-clients", labelKey: "nav.clients", targetId: "clients", order: 2, visible: true },
  { id: "nav-equipment", labelKey: "nav.equipment", targetId: "equipment", order: 3, visible: true },
  { id: "nav-services", labelKey: "nav.services", targetId: "services", order: 4, visible: true },
  { id: "nav-portfolio", labelKey: "nav.portfolio", targetId: "portfolio", order: 5, visible: true },
  { id: "nav-contact", labelKey: "nav.contact", targetId: "contact", order: 6, visible: true },
]);

export async function listNavItems(visibleOnly = false): Promise<NavItem[]> {
  return request({
    method: "GET",
    run: async () => {
      const { items } = await listCollection<NavItem>(KEY);
      const filtered = visibleOnly ? items.filter((i) => i.visible) : items;
      return [...filtered].sort((a, b) => a.order - b.order);
    },
  });
}

export async function updateNavItem(id: string, patch: Partial<NavItem>): Promise<NavItem> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: () => updateItem<NavItem>(KEY, id, patch),
  });
}

export async function reorderNavItems(orderedIds: string[]): Promise<NavItem[]> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: async () => {
      const reordered = await reorderItems<NavItem>(KEY, orderedIds);
      return Promise.all(
        reordered.map((item, index) => updateItem<NavItem>(KEY, item.id, { order: index })),
      );
    },
  });
}
