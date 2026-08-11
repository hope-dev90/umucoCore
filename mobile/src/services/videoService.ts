import { api, assetUrl, getErrorMessage } from './api';
import type { VideoItem } from '../types';

export async function getVideos(): Promise<VideoItem[]> {
  try {
    const { data } = await api.get('/api/video');
    const items: VideoItem[] = Array.isArray(data) ? data : data.video || data.items || [];
    return items.map((v) => ({
      ...v,
      video_url: assetUrl(v.video_url) || v.video_url || '',
      thumbnail_url: assetUrl(v.thumbnail_url) || v.thumbnail_url || '',
    }));
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to load videos'));
  }
}
