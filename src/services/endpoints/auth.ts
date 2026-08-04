import { seed, getDoc } from "../localStore";
import { setTokens, clearTokens, isAuthenticated, request } from "../apiClient";
import { ApiError } from "../localStore";

interface AdminCredentials {
  email: string;
  password: string;
}

const KEY = "auth:credentials";

seed<AdminCredentials>(KEY, {
  email: "admin@phoenixmedia.com",
  password: "phoenix2026",
});

export async function login(email: string, password: string) {
  return request({
    method: "POST",
    run: async () => {
      const creds = await getDoc<AdminCredentials>(KEY);
      if (creds.email !== email || creds.password !== password) {
        throw new ApiError("Invalid email or password", 401);
      }
      setTokens(`mock-token-${Date.now()}`, `mock-refresh-${Date.now()}`);
      return { email };
    },
  });
}

export function logout(): void {
  clearTokens();
}

export function currentSession(): boolean {
  return isAuthenticated();
}
