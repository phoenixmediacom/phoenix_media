import api from "../apiClient";
import type { LogoItem } from "../types";

// الواجهة العامة (Public)
export async function getPublicEquipment(): Promise<LogoItem[]> {
  const response = await api.get<{ data: any[] }>("/api/public/equipment");
  return (response.data.data || response.data || []).map((item) => ({
    id: String(item.id),
    name: item.name,
    logoUrl: item.logo || item.logo_url || "",
    order: item.order ?? 0,
  }));
}

// لوحة التحكم (Admin)
export async function listEquipment(): Promise<LogoItem[]> {
  const response = await api.get<{ data: any[] }>("/api/admin/equipment");
  return (response.data.data || response.data || []).map((item) => ({
    id: String(item.id),
    name: item.name,
    logoUrl: item.logo || item.logo_url || "",
    order: item.order ?? 0,
  }));
}

export async function createEquipment(
  input: Omit<LogoItem, "id" | "order">
): Promise<LogoItem> {
  const response = await api.post<{ data: any }>("/api/admin/equipment", {
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

export async function updateEquipment(
  id: string,
  patch: Partial<LogoItem>
): Promise<LogoItem> {
  const payload: Record<string, any> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.logoUrl !== undefined) payload.logo_url = patch.logoUrl;

  // استخدام POST لتوافق مسار Laravel: Route::post('/{equipment}', ...)
  const response = await api.post<{ data: any }>(`/api/admin/equipment/${id}`, payload);
  const updated = response.data.data || response.data;
  return {
    id: String(updated.id),
    name: updated.name,
    logoUrl: updated.logo || updated.logo_url || "",
    order: updated.order ?? 0,
  };
}

export async function deleteEquipment(id: string): Promise<void> {
  await api.delete(`/api/admin/equipment/${id}`);
}

export async function reorderEquipment(orderedIds: string[]): Promise<LogoItem[]> {
  const orders = orderedIds.map((id, index) => ({
    id: Number(id) || id,
    order: index + 1,
  }));

  await api.post("/api/admin/equipment/reorder", { orders });
  return listEquipment();
}