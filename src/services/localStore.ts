/**
 * This is the "backend" for the demo: a small, deterministic mock server
 * backed by localStorage instead of a real database. Every function here
 * mirrors the shape a real HTTP call would have (async, can fail, has
 * latency), specifically so `services/endpoints/*` can be pointed at a
 * real API later by editing only that one file per domain — no page or
 * admin component would need to change.
 */

const NAMESPACE = "phoenix-media:v1:";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
}

/** Simulated network latency so loading states are real, not instant. */
function delay(ms = 220 + Math.random() * 260): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Seeds a key exactly once; safe to call on every import. */
export function seed<T>(key: string, initial: T): void {
  const existing = window.localStorage.getItem(NAMESPACE + key);
  if (existing === null) write(key, initial);
}

export async function getDoc<T>(key: string): Promise<T> {
  await delay();
  return read<T>(key, undefined as unknown as T);
}

export async function setDoc<T>(key: string, value: T): Promise<T> {
  await delay();
  write(key, value);
  return value;
}

export interface ListParams {
  search?: string;
  searchFields?: string[];
  page?: number;
  pageSize?: number;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listCollection<T extends { id: string }>(
  key: string,
  params: ListParams = {},
): Promise<ListResult<T>> {
  await delay();
  let items = read<T[]>(key, []);

  if (params.search && params.searchFields?.length) {
    const q = params.search.toLowerCase();
    items = items.filter((item) =>
      params.searchFields!.some((field) =>
        String((item as Record<string, unknown>)[field] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  const total = items.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? (total || 1);
  const start = (page - 1) * pageSize;
  const paged = params.pageSize ? items.slice(start, start + pageSize) : items;

  return { items: paged, total, page, pageSize: params.pageSize ?? total };
}

export async function createItem<T extends { id: string }>(
  key: string,
  item: T,
): Promise<T> {
  await delay();
  const items = read<T[]>(key, []);
  items.push(item);
  write(key, items);
  return item;
}

export async function updateItem<T extends { id: string }>(
  key: string,
  id: string,
  patch: Partial<T>,
): Promise<T> {
  await delay();
  const items = read<T[]>(key, []);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new ApiError(`Item ${id} not found`, 404);
  items[index] = { ...items[index], ...patch };
  write(key, items);
  return items[index];
}

export async function deleteItem<T extends { id: string }>(
  key: string,
  id: string,
): Promise<void> {
  await delay();
  const items = read<T[]>(key, []);
  write(
    key,
    items.filter((i) => i.id !== id),
  );
}

export async function reorderItems<T extends { id: string }>(
  key: string,
  orderedIds: string[],
): Promise<T[]> {
  await delay();
  const items = read<T[]>(key, []);
  const byId = new Map(items.map((i) => [i.id, i]));
  const reordered = orderedIds.map((id) => byId.get(id)).filter(Boolean) as T[];
  write(key, reordered);
  return reordered;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
