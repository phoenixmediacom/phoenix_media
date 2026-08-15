import { request } from "../apiClient";

export interface DashboardStats {
  portfolio_events: number;
  published_events: number;
  clients: number;
  services: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request({
    url: "/admin/dashboard",
    method: "GET",
  }).then((res: any) => res.data?.stats || res.stats);
}