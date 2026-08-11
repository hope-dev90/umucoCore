import { api, getErrorMessage } from './api';
import type { HistoryItem, HistoryStats } from '../types';

export async function getHistory(limit?: number): Promise<HistoryItem[]> {
  try {
    const { data } = await api.get('/api/history', {
      params: limit ? { limit } : undefined,
    });
    return data.items || [];
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load history'));
  }
}

export async function getHistoryStats(): Promise<HistoryStats> {
  try {
    const { data } = await api.get<HistoryStats>('/api/history/stats');
    return data || {};
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load history stats'));
  }
}

export async function trackView(payload: {
  type: string;
  itemId?: number | string;
  title?: string;
  image?: string;
  category?: string;
  location?: string;
}): Promise<void> {
  try {
    await api.post('/api/history', {
      itemType: payload.type,
      itemId: payload.itemId != null ? String(payload.itemId) : undefined,
      title: payload.title,
      image: payload.image || undefined,
      category: payload.category || undefined,
      location: payload.location || undefined,
    });
  } catch {
    // non-blocking
  }
}
