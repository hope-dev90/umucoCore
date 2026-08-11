import { api, getErrorMessage } from './api';
import type { Badge, Collectible, GamificationXP } from '../types';

export type AwardXPResult = {
  user?: { xp?: number; level?: number };
  newBadges?: Badge[];
  xp?: number;
  level?: number;
};

export type DailyLoginResult = {
  currentStreak?: number;
  streak?: number;
  bestStreak?: number;
  isNew?: boolean;
  [key: string]: unknown;
};

export async function fetchXP(): Promise<GamificationXP | null> {
  try {
    const { data } = await api.get('/api/gamification/xp');
    return data.data || data;
  } catch {
    return null;
  }
}

export async function fetchLevels(): Promise<Array<{ level: number; requiredXP: number }>> {
  try {
    const { data } = await api.get('/api/gamification/levels');
    return (data.data || data || []) as Array<{ level: number; requiredXP: number }>;
  } catch {
    return [];
  }
}

export async function fetchBadges(): Promise<Badge[]> {
  try {
    const { data } = await api.get('/api/gamification/badges');
    return (data.data || data || []) as Badge[];
  } catch {
    return [];
  }
}

/** Matches frontend GamificationContext POST /api/gamification/award-xp */
export async function awardXP(amount: number, reason?: string): Promise<AwardXPResult | null> {
  try {
    const { data } = await api.post('/api/gamification/award-xp', { amount, reason });
    return data.data || data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to award XP'));
  }
}

/** Matches frontend POST /api/gamification/daily-login */
export async function dailyLogin(): Promise<DailyLoginResult | null> {
  try {
    const { data } = await api.post('/api/gamification/daily-login');
    return data.data || data;
  } catch {
    return null;
  }
}

/** Matches frontend POST /api/gamification/track-activity */
export async function trackActivity(activityType: string, itemId?: string | number): Promise<void> {
  try {
    await api.post('/api/gamification/track-activity', { activityType, itemId });
  } catch {
    // non-blocking
  }
}

/** Matches frontend GamificationContext fetch of activity item ids */
export async function fetchUserActivityItems(activityType: string): Promise<string[]> {
  try {
    const { data } = await api.get(`/api/gamification/activity/${activityType}/items`);
    const items = data.data || data.items || data || [];
    return (Array.isArray(items) ? items : []).map(String);
  } catch {
    return [];
  }
}

export async function fetchLeaderboard(): Promise<unknown[]> {
  try {
    const { data } = await api.get('/api/gamification/leaderboard');
    return data.data || [];
  } catch {
    return [];
  }
}

export async function fetchMyBadges(): Promise<Badge[]> {
  try {
    const { data } = await api.get('/api/gamification/my-badges');
    return (data.data || []) as Badge[];
  } catch {
    return [];
  }
}

export async function fetchCollectibles(): Promise<Collectible[]> {
  try {
    const { data } = await api.get('/api/gamification/collectibles');
    return (data.data || []) as Collectible[];
  } catch {
    return [];
  }
}

export async function fetchMyCollectibles(): Promise<Collectible[]> {
  try {
    const { data } = await api.get('/api/gamification/my-collectibles');
    return (data.data || []) as Collectible[];
  } catch {
    return [];
  }
}
