import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig  } from 'axios';

// تكوين API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phoenix-media-api.onrender.com';

// إنشاء Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Token management
const TOKEN_KEY = 'phoenix_auth_token';
const USER_KEY = 'phoenix_auth_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): any | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Request interceptor - إضافة Token تلقائياً
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // ✅ معالجة 401
    if (error.response?.status === 401) {
      removeToken();
      
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && !currentPath.startsWith('/admin/auth')) {
        window.location.href = '/admin/auth/login';
      }
    }
    
    // ✅ معالجة CORS errors
    if (!error.response && error.message.includes('Network Error')) {
      console.error('❌ CORS or Network Error:', {
        message: error.message,
        config: error.config,
        apiUrl: API_BASE_URL,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper للـ requests
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
}

// Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}