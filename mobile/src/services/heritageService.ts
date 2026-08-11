import { api, assetUrl, getErrorMessage } from './api';
import type { HeritageItem } from '../types';

function normalizeHeritage(item: HeritageItem): HeritageItem {
  return {
    ...item,
    image_url: assetUrl(item.image_url || item.image) || item.image_url || item.image,
  };
}

export async function getHeritage(category?: string): Promise<HeritageItem[]> {
  try {
    const { data } = await api.get('/api/heritage', {
      params: category ? { category } : undefined,
    });
    const items: HeritageItem[] = Array.isArray(data) ? data : data.items || data.heritage || [];
    return items.map(normalizeHeritage);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load heritage'));
  }
}
