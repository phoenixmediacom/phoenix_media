import api from "../apiClient";
import type { PortfolioEvent } from "../types";

// 1. الواجهة العامة (Public)
export async function getPublicPortfolio(): Promise<PortfolioEvent[]> {
  const response = await api.get("/api/public/portfolio");
  return response.data?.data || response.data || [];
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioEvent | undefined> {
  const response = await api.get(`/api/public/portfolio/${slug}`);
  return response.data?.data || response.data;
}

// 2. لوحة التحكم (Admin)
export async function listPortfolio(publishedOnly = false): Promise<PortfolioEvent[]> {
  const response = await api.get("/api/admin/portfolio", {
    params: publishedOnly ? { published: true } : undefined,
  });
  return response.data?.data || response.data || [];
}

export async function getPortfolioEvent(id: string): Promise<PortfolioEvent | undefined> {
  const response = await api.get(`/api/admin/portfolio/${id}`);
  return response.data?.data || response.data;
}

export async function createPortfolioEvent(
  input: Omit<PortfolioEvent, "id" | "order">,
): Promise<PortfolioEvent> {
  const payload = {
    ...input,
    cover_image: input.cover_image_url,
  };
  const response = await api.post("/api/admin/portfolio", payload);
  return response.data?.data || response.data;
}

export async function updatePortfolioEvent(
  id: string,
  patch: Partial<PortfolioEvent>,
): Promise<PortfolioEvent> {
  const payload = {
    ...patch,
    ...(patch.cover_image_url !== undefined && { cover_image: patch.cover_image_url }),
  };
  const response = await api.put(`/api/admin/portfolio/${id}`, payload);
  return response.data?.data || response.data;
}

export async function deletePortfolioEvent(id: string): Promise<void> {
  await api.delete(`/api/admin/portfolio/${id}`);
}

// ✅ تم إصلاح payload ليطابق Laravel Controller
export async function reorderPortfolioEvents(orderedIds: string[]): Promise<PortfolioEvent[]> {
  const orders = orderedIds.map((id, index) => ({
    id: Number(id) || id,
    order: index + 1,
  }));

  const response = await api.post("/api/admin/portfolio/reorder", { orders });
  return response.data?.data || response.data;
}