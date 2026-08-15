import { request } from "../apiClient";
import type { ContactInfo, ContactSubmission } from "../types";

/**
 * ========================================
 * 🔄 Helper Functions
 * ========================================
 */

function mapContactFromApi(item: any): ContactInfo {
  return {
    email: item?.email || "",
    phone: item?.phone || "",
    whatsapp: item?.whatsapp || "",
    address: typeof item?.address === "object" 
      ? (item?.address?.ar || item?.address?.en || "") 
      : (item?.address || ""),
    mapEmbedUrl: item?.google_maps_embed_url  ,
  };
}

function mapSubmissionFromApi(item: any): ContactSubmission {
  return {
    id: item?.id?.toString() || "",
    name: item?.name || "",
    email: item?.email || "",
    message: item?.message || "",
    status: item?.status || "new",
    ipAddress: item?.ip_address || "",
    createdAt: item?.created_at || "",
    readAt: item?.read_at || null,
  };
}

// 1. الواجهة العامة (Public)
export async function getContactInfo(): Promise<ContactInfo> {
  return request({
    url: "/public/contact",
    method: "GET",
  }).then((res: any) => mapContactFromApi(res?.data || res));
}

export async function submitContactForm(data: { 
  name: string; 
  email: string;
  phone?: string;
  message: string;
  // ✅ honeypot fields (للحماية من السبام)
  website?: string;
  url?: string;
}): Promise<void> {
  return request({
    url: "/public/contact/submit",
    method: "POST",
    data,
  });
}

// 2. لوحة التحكم (Admin)
export async function getAdminContactInfo(): Promise<ContactInfo> {
  return request({
    url: "/admin/contact",
    method: "GET",
  }).then((res: any) => mapContactFromApi(res?.data || res));
}

export async function updateContactInfo(info: ContactInfo): Promise<ContactInfo> {
  const payload = {
    email: info.email,
    phone: info.phone,
    whatsapp: info.whatsapp,
    address: info.address || "",
    google_maps_embed_url : info.mapEmbedUrl || "",
  };

  return request({
    url: "/admin/contact",
    method: "POST",
    data: payload,
  }).then((res: any) => mapContactFromApi(res?.data || res));
}

/**
 * ========================================
 * 📩 Contact Submissions Management
 * ========================================
 */

export interface SubmissionsFilters {
  status?: 'new' | 'read' | 'replied' | 'archived';
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface SubmissionsResponse {
  data: ContactSubmission[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: {
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  };
}

export interface SubmissionStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
  today: number;
  this_week: number;
  this_month: number;
  last_7_days: Array<{ date: string; count: number }>;
}

/**
 * قائمة الرسائل مع الفلترة
 */
export async function listContactSubmissions(
  filters: SubmissionsFilters = {}
): Promise<SubmissionsResponse> {
  return request({
    url: "/admin/contact/submissions",
    method: "GET",
    params: filters,
  }).then((res: any) => ({
    data: (res?.data || []).map(mapSubmissionFromApi),
    meta: res?.meta || {},
    stats: res?.stats || {},
  }));
}

/**
 * عرض رسالة واحدة
 */
export async function getSubmission(id: string): Promise<ContactSubmission> {
  return request({
    url: `/admin/contact/submissions/${id}`,
    method: "GET",
  }).then((res: any) => mapSubmissionFromApi(res?.data || res));
}

/**
 * تحديث حالة رسالة
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'new' | 'read' | 'replied' | 'archived'
): Promise<ContactSubmission> {
  return request({
    url: `/admin/contact/submissions/${id}/status`,
    method: "PATCH",
    data: { status },
  }).then((res: any) => mapSubmissionFromApi(res?.data || res));
}

/**
 * تحديد رسالة كمقروءة
 */
export async function markSubmissionAsRead(id: string): Promise<ContactSubmission> {
  return request({
    url: `/admin/contact/submissions/${id}/read`,
    method: "PATCH",
  }).then((res: any) => mapSubmissionFromApi(res?.data || res));
}

/**
 * أرشفة رسالة
 */
export async function archiveSubmission(id: string): Promise<ContactSubmission> {
  return request({
    url: `/admin/contact/submissions/${id}/archive`,
    method: "PATCH",
  }).then((res: any) => mapSubmissionFromApi(res?.data || res));
}

/**
 * حذف رسالة
 */
export async function deleteSubmission(id: string): Promise<void> {
  return request({
    url: `/admin/contact/submissions/${id}`,
    method: "DELETE",
  });
}

/**
 * ========================================
 * 📊 Bulk Actions (إجراءات جماعية)
 * ========================================
 */

/**
 * تحديد عدة رسائل كمقروءة
 */
export async function markMultipleAsRead(ids: string[]): Promise<{ count: number }> {
  return request({
    url: "/admin/contact/submissions/bulk/read",
    method: "POST",
    data: { ids },
  });
}

/**
 * أرشفة عدة رسائل
 */
export async function archiveMultiple(ids: string[]): Promise<{ count: number }> {
  return request({
    url: "/admin/contact/submissions/bulk/archive",
    method: "POST",
    data: { ids },
  });
}

/**
 * حذف عدة رسائل
 */
export async function deleteMultiple(ids: string[]): Promise<{ count: number }> {
  return request({
    url: "/admin/contact/submissions/bulk/delete",
    method: "POST",
    data: { ids },
  });
}

/**
 * حذف جميع الرسائل المؤرشفة
 */
export async function deleteAllArchived(): Promise<{ count: number }> {
  return request({
    url: "/admin/contact/submissions/archived/all",
    method: "DELETE",
  });
}

/**
 * ========================================
 * 📈 Statistics & Export
 * ========================================
 */

/**
 * إحصائيات شاملة
 */
export async function getSubmissionsStatistics(): Promise<SubmissionStats> {
  return request({
    url: "/admin/contact/submissions/statistics",
    method: "GET",
  }).then((res: any) => res?.data || res);
}


/**
 * Export contact submissions (using fetch)
 */
export async function exportSubmissions(params: {
  format: 'xlsx' | 'csv';
  type: 'all' | 'filtered' | 'selected';
  filters?: SubmissionsFilters;
  selectedIds?: string[];
}): Promise<Blob> {
  const token = localStorage.getItem('auth_token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const response = await fetch(`${baseURL}/admin/contact/submissions/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Export failed: ${errorText || response.statusText}`);
  }

  return response.blob();
}

/**
 * Helper: Download exported file
 */
export function downloadExportedFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}