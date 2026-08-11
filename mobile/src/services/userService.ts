import { api, apiUrl, assetUrl, getErrorMessage, getToken } from './api';
import type { ExplorerType, User } from '../types';

export async function updateProfile(payload: {
  fullName?: string;
  name?: string;
  language?: string;
}): Promise<User | null> {
  try {
    const body: Record<string, string> = {};
    if (payload.fullName || payload.name) {
      body.fullName = String(payload.fullName || payload.name);
    }
    if (payload.language) body.language = payload.language;
    const { data } = await api.put('/api/users/profile', body);
    return data.user || data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to update profile'));
  }
}

export async function updateExplorerType(explorerType: ExplorerType | string): Promise<void> {
  try {
    await api.put('/api/users/explorer-type', { explorerType });
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to save explorer type'));
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await api.put('/api/users/password', { currentPassword, newPassword });
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to update password'));
  }
}

export async function updateNotifications(notifications: {
  archiveUpdates?: boolean;
  newsletter?: boolean;
  eventReminders?: boolean;
}): Promise<void> {
  try {
    await api.put('/api/users/notifications', notifications);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to save notification preferences'));
  }
}

export async function updateAccessibility(accessibility: Record<string, unknown>): Promise<void> {
  try {
    await api.put('/api/users/accessibility', accessibility);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to save accessibility settings'));
  }
}

export async function uploadAvatar(uri: string, mimeType = 'image/jpeg', fileName = 'avatar.jpg'): Promise<string> {
  try {
    const form = new FormData();
    form.append('avatar', {
      uri,
      type: mimeType,
      name: fileName,
    } as unknown as Blob);
    const token = await getToken();
    const response = await fetch(apiUrl('/api/users/avatar'), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Failed to upload avatar');
    }
    const data = await response.json();
    return assetUrl(data.avatar) || data.avatar;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to upload avatar'));
  }
}

export async function fetchSessions(): Promise<unknown[]> {
  try {
    const { data } = await api.get('/api/users/sessions');
    return data.sessions || data.data || [];
  } catch {
    return [];
  }
}

export async function exportUserData(): Promise<Record<string, unknown>> {
  try {
    const { data } = await api.get('/api/users/export-data');
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to export data'));
  }
}

export async function deactivateAccount(): Promise<void> {
  try {
    await api.post('/api/users/deactivate');
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to deactivate account'));
  }
}

export async function deleteAccount(password: string): Promise<void> {
  try {
    await api.delete('/api/users/account', { data: { password } });
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to delete account'));
  }
}

export function resolveAvatar(user?: User | null): string | null {
  if (!user) return null;
  return assetUrl(user.profileImage || user.avatar) || user.profileImage || null;
}
