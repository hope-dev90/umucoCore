import { api, getErrorMessage } from './api';
import type { SavedItem, SavedResponse } from '../types';

export async function getSaved(): Promise<SavedResponse> {
  try {
    const { data } = await api.get<SavedResponse>('/api/saved');
    return {
      items: data.items || [],
      stats: data.stats || {
        total: (data.items || []).length,
        audio: 0,
        storageUsedMB: 0,
        storageLimitMB: 5120,
      },
    };
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load saved items'));
  }
}

export async function saveItem(payload: {
  itemType: string;
  itemId: number | string;
  itemTitle: string;
  itemSubtitle?: string;
  itemImage?: string;
  itemMeta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await api.post('/api/saved', payload);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to save item'));
  }
}

export async function removeSaved(itemId: number | string): Promise<void> {
  try {
    await api.delete(`/api/saved/${itemId}`);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to remove saved item'));
  }
}

export type { SavedItem };
