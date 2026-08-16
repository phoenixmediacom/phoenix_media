import { request } from "../apiClient";
import type { ServiceItem, ServiceIcon } from "../types";

function mapServiceFromApi(item: any): ServiceItem {
  return {
    id: String(item.id),
    icon: {
      type: item.icon_type as ServiceIcon["type"],
      value: item.icon_value || "",
    } as ServiceIcon,
    title: {
      en: item.title?.en || "",
      ar: item.title?.ar || "",
    },
    description: {
      en: item.description?.en || "",
      ar: item.description?.ar || "",
    },
    order: item.order ?? 0,
  };
}

// 1. الواجهة العامة (Public)
export async function getPublicServices(): Promise<ServiceItem[]> {
  return request({
    url: "/api/public/services",
    method: "GET",
  }).then((res: any) => {
    const list = res?.data || res || [];
    return list.map(mapServiceFromApi).sort((a: ServiceItem, b: ServiceItem) => a.order - b.order);
  });
}

// 2. لوحة التحكم (Admin)
export async function listServices(): Promise<ServiceItem[]> {
  return request({
    url: "/api/admin/services",
    method: "GET",
  }).then((res: any) => {
    const list = res?.data || res || [];
    return list.map(mapServiceFromApi).sort((a: ServiceItem, b: ServiceItem) => a.order - b.order);
  });
}

export async function createService(
  input: Omit<ServiceItem, "id" | "order"> & { iconFile?: File | null }
): Promise<ServiceItem> {
  const formData = new FormData();
  formData.append("icon_type", input.icon.type);
  formData.append("icon_value", input.icon.value || "");
  formData.append("title[en]", input.title.en);
  formData.append("title[ar]", input.title.ar);
  formData.append("description[en]", input.description.en);
  formData.append("description[ar]", input.description.ar);

  if (input.icon.type === "image" && input.iconFile) {
    formData.append("icon_file", input.iconFile);
  }

  return request({
    url: "/api/admin/services",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res: any) => mapServiceFromApi(res.data || res));
}

// ✅ تحسين: استخدام _method=PUT لدعم multipart في Laravel
export async function updateService(
  id: string,
  input: Partial<Omit<ServiceItem, "id">> & { iconFile?: File | null }
): Promise<ServiceItem> {
  const formData = new FormData();
  formData.append("_method", "PUT");

  if (input.icon) {
    formData.append("icon_type", input.icon.type);
    formData.append("icon_value", input.icon.value || "");
  }
  if (input.title) {
    formData.append("title[en]", input.title.en);
    formData.append("title[ar]", input.title.ar);
  }
  if (input.description) {
    formData.append("description[en]", input.description.en);
    formData.append("description[ar]", input.description.ar);
  }
  if (input.icon?.type === "image" && input.iconFile) {
    formData.append("icon_file", input.iconFile);
  }

  return request({
    url: `/api/admin/services/${id}`,
    method: "POST", // ✅ نستخدم POST مع _method=PUT
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res: any) => mapServiceFromApi(res.data || res));
}

export async function deleteService(id: string): Promise<void> {
  return request({
    url: `/api/admin/services/${id}`,
    method: "DELETE",
  });
}

export async function reorderServices(orderedIds: string[]): Promise<void> {
  const payload = {
    orders: orderedIds.map((id, index) => ({ id, order: index })),
  };

  return request({
    url: "/api/admin/services/reorder",
    method: "POST",
    data: payload,
  });
}