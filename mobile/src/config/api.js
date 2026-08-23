import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Same default as web (VITE_API_BASE), read from app.json -> extra.apiBase instead of import.meta.env
export const API_BASE = Constants.expoConfig?.extra?.apiBase || 'https://umucocore.onrender.com';

export function apiUrl(path = '') {
  if (/^https?:\/\//i.test(path)) return path;

  // Ensure API_BASE has protocol
  let base = API_BASE.replace(/\/$/, '');
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  // Remove leading slash from path if present
  const normalizedPath = path.replace(/^\//, '');

  return `${base}/${normalizedPath}`;
}

export function assetUrl(path = '') {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return apiUrl(path);
}

// NOTE: on web this read localStorage synchronously. AsyncStorage is
// promise-based, so this helper (and every caller) is async — the only
// structural change required; the request/header logic is unchanged.
export async function getToken() {
  return AsyncStorage.getItem('token');
}

export async function apiFetch(path, options = {}) {
  const token = await getToken();
  const hasBody = options.body != null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(apiUrl(path), { ...options, headers });
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}
