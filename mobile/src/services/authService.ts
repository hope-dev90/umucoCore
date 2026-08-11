import { api, apiUrl, assetUrl, clearToken, getErrorMessage, setToken } from './api';
import type { AuthResponse, ExplorerType, User } from '../types';

function normalizeUser(user: User): User {
  const avatarUrl = assetUrl(user.avatar);
  return {
    ...user,
    profileImage: avatarUrl || user.profileImage || null,
  };
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    if (!data.token || !data.user) throw new Error(data.message || 'Login failed');
    await setToken(data.token);
    return { user: normalizeUser(data.user), token: data.token };
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Login failed'));
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  explorerType?: ExplorerType | string
): Promise<{ message?: string }> {
  try {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      explorerType,
    });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Registration failed'));
  }
}

export async function verifyEmail(email: string, otp: string): Promise<{ user: User; token: string }> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/verify-email', { email, otp });
    if (!data.token || !data.user) throw new Error(data.message || 'Verification failed');
    await setToken(data.token);
    return { user: normalizeUser(data.user), token: data.token };
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Verification failed'));
  }
}

export async function resendOtp(email: string): Promise<{ message?: string }> {
  try {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to resend OTP'));
  }
}

export async function googleLogin(idToken: string): Promise<{ user: User; token: string }> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/google', { idToken });
    if (!data.token || !data.user) throw new Error(data.message || 'Google login failed');
    await setToken(data.token);
    return { user: normalizeUser(data.user), token: data.token };
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Google login failed'));
  }
}

export async function forgotPassword(email: string): Promise<{ message?: string }> {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to send reset email'));
  }
}

export async function fetchProfile(): Promise<User | null> {
  try {
    const { data } = await api.get<{ user: User }>('/auth/profile');
    if (!data.user) return null;
    return normalizeUser(data.user);
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await clearToken();
}

export { apiUrl };
