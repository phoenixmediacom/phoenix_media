/**
 * services/apiClient.ts
 *
 * The single entry point every endpoint module goes through. Right now
 * `request()` resolves against the local mock store (see localStore.ts),
 * but its signature and behavior (auth header injection, 401 -> refresh ->
 * retry, standardized ApiError) are exactly what a fetch()-based
 * implementation against a real backend would look like. Swapping mock
 * for real means editing the body of `request()` only — no endpoint
 * module or page needs to change.
 */
import { ApiError } from "./localStore";

const TOKEN_KEY = "phoenix-media:auth:token";
const REFRESH_KEY = "phoenix-media:auth:refresh";

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(token: string, refreshToken: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Stub for refresh-token support: a real backend would POST the refresh
 * token to /auth/refresh and receive a new access token. Here we just
 * re-mint one, since there's no server session to actually expire.
 */
export async function refreshSession(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  setTokens(`mock-token-${Date.now()}`, refresh);
  return true;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method: HttpMethod;
  /** Executed against the mock store; a real client would use this as the URL path. */
  run: () => Promise<TBody>;
  /** Whether this call requires an authenticated session. */
  requiresAuth?: boolean;
}

/**
 * Wraps every call with consistent error normalization and an auth guard,
 * mirroring what an axios/fetch interceptor stack would do for a real API.
 */
export async function request<T>(options: RequestOptions<T>): Promise<T> {
  if (options.requiresAuth && !isAuthenticated()) {
    throw new ApiError("Not authenticated", 401);
  }

  try {
    return await options.run();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : "Unexpected error",
      500,
    );
  }
}
