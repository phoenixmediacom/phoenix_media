import api from "../apiClient";
import type { LogoItem } from "../types";

// جلب للعملاء في الواجهة العامة (Public)
export async function getPublicClients(): Promise<LogoItem[]> {
  const response = await api.get<{ data: any[] }>("/api/public/clients");
  return (response.data.data || response.data || []).map((item) => ({
    id: String(item.id),
    name: item.name,
    logoUrl: item.logo || item.logo_url || "",
    order: item.order ?? 0,
  }));
}

// جلب العملاء في لوحة التحكم (Admin)
export async function listClients(): Promise<LogoItem[]> {
  const response = await api.get<{ data: any[] }>("/api/admin/clients");
  return (response.data.data || response.data || []).map((item) => ({
    id: String(item.id),
    name: item.name,
    logoUrl: item.logo || item.logo_url || "",
    order: item.order ?? 0,
  }));
}

export async function createClient(
  input: Omit<LogoItem, "id" | "order">
): Promise<LogoItem> {
  const response = await api.post<{ data: any }>("/api/admin/clients", {
    name: input.name,
    logo_url: input.logoUrl,
  });
  const created = response.data.data || response.data;
  return {
    id: String(created.id),
    name: created.name,
    logoUrl: created.logo || created.logo_url || "",
    order: created.order ?? 0,
  };
}

export async function updateClient(
  id: string,
  patch: Partial<LogoItem>
): Promise<LogoItem> {
  const payload: Record<string, any> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.logoUrl !== undefined) payload.logo_url = patch.logoUrl;

  // تم استخدام POST لتنفيذ التحديث بما يتوافق مع Laravel Routes: Route::post('/{client}', ...)
  const response = await api.post<{ data: any }>(`/api/admin/clients/${id}`, payload);
  const updated = response.data.data || response.data;
  return {
    id: String(updated.id),
    name: updated.name,
    logoUrl: updated.logo || updated.logo_url || "",
    order: updated.order ?? 0,
  };
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/api/admin/clients/${id}`);
}

export async function reorderClients(orderedIds: string[]): Promise<LogoItem[]> {
  const orders = orderedIds.map((id, index) => ({
    id: Number(id) || id,
    order: index + 1,
  }));

  await api.post("/api/admin/clients/reorder", { orders });
  return listClients();
}