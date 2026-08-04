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
import type { PortfolioEvent } from "../types";

const KEY = "portfolio";

const IMG = (seedName: string, w = 1200, h = 800) =>
  `https://picsum.photos/seed/${encodeURIComponent(seedName)}/${w}/${h}`;

seed<PortfolioEvent[]>(KEY, [
  {
    id: "evt-aseer",
    title: "Aseer Summer Season",
    slug: "aseer-summer-season",
    coverImageUrl: IMG("aseer-cover", 1600, 900),
    companyLogoUrl: "/logo.png",
    clientLogoUrl: IMG("aseer-client-logo", 300, 300),
    behindTheScenes: false,
    published: true,
    order: 0,
    sections: [
      {
        id: newId(),
        type: "hero-video",
        order: 0,
        videoUrl: "https://cdn.coverr.co/videos/coverr-a-concert-crowd-8945/1080p.mp4",
        posterUrl: IMG("aseer-hero-poster", 1600, 900),
        showPlayButton: true,
      },
      {
        id: newId(),
        type: "people",
        order: 1,
        heroImageUrl: IMG("aseer-people-hero", 1600, 900),
        people: [
          { id: newId(), name: "Mohammed Abdo", photoUrl: IMG("p1", 400, 400), order: 0, gallery: [
            { id: newId(), type: "image", url: IMG("p1-g1") },
            { id: newId(), type: "image", url: IMG("p1-g2") },
          ]},
          { id: newId(), name: "Al Maany & Ayed", photoUrl: IMG("p2", 400, 400), order: 1, gallery: [
            { id: newId(), type: "image", url: IMG("p2-g1") },
          ]},
          { id: newId(), name: "Rabeh Saqer", photoUrl: IMG("p3", 400, 400), order: 2, gallery: [
            { id: newId(), type: "image", url: IMG("p3-g1") },
          ]},
        ],
      },
      {
        id: newId(),
        type: "gallery",
        order: 2,
        layout: "grid",
        items: [
          { id: newId(), type: "image", url: IMG("aseer-g1") },
          { id: newId(), type: "image", url: IMG("aseer-g2") },
          { id: newId(), type: "image", url: IMG("aseer-g3") },
          { id: newId(), type: "image", url: IMG("aseer-g4") },
        ],
      },
    ],
  },
  {
    id: "evt-4events",
    title: "4Events Corporate Launch",
    slug: "4events-corporate-launch",
    coverImageUrl: IMG("4events-cover", 1600, 900),
    companyLogoUrl: "/logo.png",
    clientLogoUrl: IMG("4events-client-logo", 300, 300),
    behindTheScenes: true,
    published: true,
    order: 1,
    sections: [
      {
        id: newId(),
        type: "text",
        order: 0,
        heading: "A cinematic brand launch",
        body: "Full-day multi-camera coverage of a corporate rebrand event, from arrival through the closing keynote.",
      },
      {
        id: newId(),
        type: "gallery",
        order: 1,
        layout: "masonry",
        items: [
          { id: newId(), type: "image", url: IMG("4e-g1", 900, 1200) },
          { id: newId(), type: "image", url: IMG("4e-g2", 1200, 800) },
          { id: newId(), type: "image", url: IMG("4e-g3", 900, 900) },
          { id: newId(), type: "image", url: IMG("4e-g4", 1200, 1500) },
          { id: newId(), type: "image", url: IMG("4e-g5", 1200, 800) },
        ],
      },
    ],
  },
]);

export async function listPortfolio(publishedOnly = false): Promise<PortfolioEvent[]> {
  return request({
    method: "GET",
    run: async () => {
      const { items } = await listCollection<PortfolioEvent>(KEY);
      const filtered = publishedOnly ? items.filter((e) => e.published) : items;
      return [...filtered].sort((a, b) => a.order - b.order);
    },
  });
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioEvent | undefined> {
  return request({
    method: "GET",
    run: async () => {
      const { items } = await listCollection<PortfolioEvent>(KEY);
      return items.find((e) => e.slug === slug);
    },
  });
}

export async function getPortfolioEvent(id: string): Promise<PortfolioEvent | undefined> {
  return request({
    method: "GET",
    run: async () => {
      const { items } = await listCollection<PortfolioEvent>(KEY);
      return items.find((e) => e.id === id);
    },
  });
}

export async function createPortfolioEvent(
  input: Omit<PortfolioEvent, "id" | "order">,
): Promise<PortfolioEvent> {
  return request({
    method: "POST",
    requiresAuth: true,
    run: async () => {
      const { items } = await listCollection<PortfolioEvent>(KEY);
      return createItem<PortfolioEvent>(KEY, { ...input, id: newId(), order: items.length });
    },
  });
}

export async function updatePortfolioEvent(
  id: string,
  patch: Partial<PortfolioEvent>,
): Promise<PortfolioEvent> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: () => updateItem<PortfolioEvent>(KEY, id, patch),
  });
}

export async function deletePortfolioEvent(id: string): Promise<void> {
  return request({
    method: "DELETE",
    requiresAuth: true,
    run: () => deleteItem<PortfolioEvent>(KEY, id),
  });
}

export async function reorderPortfolioEvents(orderedIds: string[]): Promise<PortfolioEvent[]> {
  return request({
    method: "PATCH",
    requiresAuth: true,
    run: async () => {
      const reordered = await reorderItems<PortfolioEvent>(KEY, orderedIds);
      return Promise.all(
        reordered.map((item, index) =>
          updateItem<PortfolioEvent>(KEY, item.id, { order: index }),
        ),
      );
    },
  });
}
