import { api, getErrorMessage } from './api';
import type { Proverb } from '../types';

export async function getProverbs(): Promise<Proverb[]> {
  try {
    const { data } = await api.get('/api/proverbs');
    const items: Proverb[] = Array.isArray(data)
      ? data
      : data.proverbs || data.items || data.data || [];
    return items;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load proverbs'));
  }
}
