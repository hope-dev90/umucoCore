import { api, getErrorMessage } from './api';
import type { Badge, Collectible, GamificationXP } from '../types';

export async function fetchXP(): Promise<GamificationXP | null> {
  try {
    const { data } = await api.get('/api/gamification/xp');
    return data.data || data;
  } catch {
    return null;
  }
}

/** Matches frontend GamificationContext POST /api/gamification/award-xp */
export async function awardXP(amount: number, reason?: string): Promise<void> {
  try {
    await api.post('/api/gamification/award-xp', { amount, reason });
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to award XP'));
  }
}

/** Matches frontend POST /api/gamification/daily-login */
export async function dailyLogin(): Promise<unknown> {
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
