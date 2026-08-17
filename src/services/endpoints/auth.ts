import api, { 
  setToken, 
  removeToken, 
  setUser, 
  getUser, 
  isAuthenticated as checkAuth 
} from '../apiClient';

// ==================== Types ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// OTP Types
export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
  expires_in_minutes: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

// ==================== Auth Functions ====================

/**
 * Login
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    // حفظ Token والمستخدم
    setToken(response.data.token);
    setUser(response.data.user);

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'فشل تسجيل الدخول';
    throw new Error(message);
  }
}

/**
 * Logout
 */
export async function logout(redirect: string = '/admin/auth/login'): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
    window.location.href = redirect;  // ✅ استخدام المسار المُمرر
  }
}

/**
 * Get Current User
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<{ user: User }>('/api/auth/me');
    setUser(response.data.user);
    return response.data.user;
  } catch (error: any) {
    removeToken();
    throw new Error(error.response?.data?.message || 'فشل جلب بيانات المستخدم');
  }
}

// ==================== Password Reset with OTP ====================

/**
 * Step 1: Send OTP to email
 */
export async function sendOtp(email: string): Promise<SendOtpResponse> {
  try {
    const response = await api.post<SendOtpResponse>('/api/auth/send-otp', {
      email,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'فشل إرسال رمز التحقق';
    throw new Error(message);
  }
}

/**
 * Step 2: Verify OTP
 */
export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  try {
    const response = await api.post<VerifyOtpResponse>('/api/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'رمز التحقق غير صحيح';
    throw new Error(message);
  }
}

/**
 * Step 3: Reset Password with OTP
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  try {
    const response = await api.post<{ message: string }>('/api/auth/reset-password', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'فشل إعادة تعيين كلمة المرور';
    throw new Error(message);
  }
}

// ==================== Helper Functions ====================

/**
 * Check if authenticated
 */
export function isAuthenticated(): boolean {
  return checkAuth();
}

/**
 * Get stored user
 */
export function getStoredUser(): User | null {
  return getUser();
}