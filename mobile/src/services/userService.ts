import { api, assetUrl, getErrorMessage } from './api';
import type { ExplorerType, User } from '../types';

export async function updateProfile(payload: Partial<{ name: string; language: string }>): Promise<User | null> {
  try {
    const { data } = await api.put('/api/users/profile', payload);
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

export function resolveAvatar(user?: User | null): string | null {
  if (!user) return null;
  return assetUrl(user.profileImage || user.avatar) || user.profileImage || null;
}
