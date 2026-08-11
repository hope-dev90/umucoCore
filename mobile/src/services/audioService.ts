import { api, assetUrl, getErrorMessage } from './api';
import type { AudioItem } from '../types';

function normalizeAudio(item: AudioItem): AudioItem {
  const audioUrl = assetUrl(item.audio_url || item.audioUrl) || item.audio_url || item.audioUrl || '';
  return {
    ...item,
    audioUrl,
    audio_url: audioUrl,
    image: assetUrl(item.thumbnail_url || item.image) || item.thumbnail_url || item.image || '',
    narrator: item.narrator || item.description || '',
    genre: item.genre || item.category || '',
  };
}

export async function getAudio(): Promise<AudioItem[]> {
  try {
    const { data } = await api.get('/api/audio');
    const items: AudioItem[] = Array.isArray(data)
      ? data
      : data.audio || data.items || [];
    return items.map(normalizeAudio);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load audio'));
  }
}

export async function getFeaturedAudio(): Promise<AudioItem | null> {
  try {
    const { data } = await api.get('/api/audio/featured');
    const item = data?.audio || data?.item || data;
    if (!item || !item.id) return null;
    return normalizeAudio(item);
  } catch {
    return null;
  }
}
