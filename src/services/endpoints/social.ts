import { request } from "../apiClient";
import type { SocialLink } from "../types";

function mapSocialFromApi(item: any): SocialLink {
  return {
    id: String(item.id),
    platform: item.platform,
    url: item.url,
    order: item.order ?? 0,
  };
}

// 1. الواجهة العامة (Public)
export async function getPublicSocialLinks(): Promise<SocialLink[]> {
  const res = await request<any>({
    url: "/api/public/social-media",
    method: "GET",
  });
  const data = res.data || res;
  return Array.isArray(data) ? data.map(mapSocialFromApi) : [];
}

// 2. لوحة التحكم (Admin)
export async function listSocialLinks(): Promise<SocialLink[]> {
  const res = await request<any>({
    url: "/api/admin/social-media",
    method: "GET",
  });
  const data = res.data || res;
  return Array.isArray(data) ? data.map(mapSocialFromApi) : [];
}

export async function createSocialLink(
  input: Omit<SocialLink, "id" | "order">,
): Promise<SocialLink> {
  const res = await request<any>({
    url: "/api/admin/social-media",
    method: "POST",
    data: input,
  });
  return mapSocialFromApi(res.data || res);
}

// ✅ تم تغيير PUT إلى POST (حسب Laravel Routes)
export async function updateSocialLink(
  id: string,
  patch: Partial<SocialLink>,
): Promise<SocialLink> {
  const res = await request<any>({
    url: `/api/admin/social-media/${id}`,
    method: "POST", // ✅ كان PUT
    data: patch,
  });
  return mapSocialFromApi(res.data || res);
}

export async function deleteSocialLink(id: string): Promise<void> {
  await request({
    url: `/api/admin/social-media/${id}`,
    method: "DELETE",
  });
}

export async function reorderSocialLinks(orderedIds: string[]): Promise<void> {
  const orders = orderedIds.map((id, index) => ({
    id: Number(id) || id,
    order: index,
  }));

  await request({
    url: "/api/admin/social-media/reorder",
    method: "POST",
    data: { orders },
  });
}