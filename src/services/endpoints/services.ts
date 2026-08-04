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
import type { ServiceItem } from "../types";

const KEY = "services";

seed<ServiceItem[]>(KEY, [
  {
    id: "svc-1",
    icon: { type: "fontawesome", value: "fa-solid fa-clapperboard" },
    title: { en: "Commercial Production", ar: "الإنتاج الإعلاني" },
    description: {
      en: "End-to-end production for brand films, TVCs, and digital campaigns.",
      ar: "إنتاج متكامل لأفلام العلامات التجارية والإعلانات التلفزيونية والحملات الرقمية.",
    },
    order: 0,
  },
  {
    id: "svc-2",
    icon: { type: "fontawesome", value: "fa-solid fa-microphone-lines" },
    title: { en: "Live Event Coverage", ar: "تغطية الفعاليات الحية" },
    description: {
      en: "Multi-camera coverage for concerts, ceremonies, and large-scale festivals.",
      ar: "تغطية متعددة الكاميرات للحفلات والمناسبات والمهرجانات الكبرى.",
    },
    order: 1,
  },
  {
    id: "svc-3",
    icon: { type: "fontawesome", value: "fa-solid fa-film" },
    title: { en: "Post-Production & Editing", ar: "المونتاج وما بعد الإنتاج" },
    description: {
      en: "Color grading, sound design, and edit finishing for cinema-grade delivery.",
      ar: "تصحيح الألوان وتصميم الصوت والمونتاج النهائي بجودة سينمائية.",
    },
    order: 2,
  },
  {
    id: "svc-4",
    icon: { type: "fontawesome", value: "fa-solid fa-video" },
    title: { en: "Documentary Filmmaking", ar: "الأفلام الوثائقية" },
    description: {
      en: "Long-form storytelling from research through festival-ready final cut.",
      ar: "سرد قصصي طويل من مرحلة البحث حتى النسخة النهائية الجاهزة للمهرجانات.",
    },
    order: 3,
  },
]);

export async function listServices(): Promise<ServiceItem[]> {
  return request({
    method: "GET",
    run: async () => {
      const { items } = await listCollection<ServiceItem>(KEY);
      return [...items].sort((a, b) => a.order - b.order);
    },
  });
}

export async function createService(
  input: Omit<ServiceItem, "id" | "order">,
): Promise<ServiceItem> {
  return request({
    method: "POST",
    requiresAuth: true,
    run: async () => {
      const { items } = await listCollection<ServiceItem>(KEY);
      return createItem<ServiceItem>(KEY, { ...input, id: newId(), order: items.length });
    },
  });
}

export async function updateService(
  id: string,
  patch: Partial<ServiceItem>,
): Promise<ServiceItem> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: () => updateItem<ServiceItem>(KEY, id, patch),
  });
}

export async function deleteService(id: string): Promise<void> {
  return request({
    method: "DELETE",
    requiresAuth: true,
    run: () => deleteItem<ServiceItem>(KEY, id),
  });
}

export async function reorderServices(orderedIds: string[]): Promise<ServiceItem[]> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: async () => {
      const reordered = await reorderItems<ServiceItem>(KEY, orderedIds);
      return Promise.all(
        reordered.map((item, index) => updateItem<ServiceItem>(KEY, item.id, { order: index })),
      );
    },
  });
}
