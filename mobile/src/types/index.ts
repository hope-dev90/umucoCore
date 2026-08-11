export type LanguageCode = 'en' | 'rw' | 'fr';

export type ExplorerType =
  | 'warrior'
  | 'nature-lover'
  | 'royal-historian'
  | 'folktale-hunter'
  | 'music-explorer';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
  profileImage?: string | null;
  explorerType?: ExplorerType | string;
  explorer_type?: ExplorerType | string;
  language?: string;
  xp?: number;
  level?: number;
  currentStreak?: number;
  bestStreak?: number;
  emailVerified?: boolean;
  xpToNextLevel?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface HeritageItem {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  image_url?: string;
  image?: string;
  location?: string;
  region?: string;
  era?: string;
  lat?: number | null;
  lng?: number | null;
  [key: string]: unknown;
}

export interface AudioItem {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  narrator?: string;
  duration?: string | number;
  durationSec?: number;
  audio_url?: string;
  audioUrl?: string;
  thumbnail_url?: string;
  image?: string;
  genre?: string;
  [key: string]: unknown;
}

export interface VideoItem {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  duration?: number | string;
  video_url?: string;
  thumbnail_url?: string;
  [key: string]: unknown;
}

export interface Proverb {
  id: number | string;
  text?: string;
  proverb?: string;
  meaning?: string;
  translation?: string;
  language?: string;
  category?: string;
  [key: string]: unknown;
}

export interface SavedItem {
  id?: number | string;
  item_id: number | string;
  item_type: string;
  item_title: string;
  item_subtitle?: string;
  item_image?: string;
  item_meta?: Record<string, unknown>;
  created_at?: string;
}

export interface SavedResponse {
  items: SavedItem[];
  stats?: {
    total: number;
    audio: number;
    storageUsedMB: number;
    storageLimitMB: number;
  };
}

export interface HistoryItem {
  id: number | string;
  title: string;
  type?: string;
  category?: string;
  image?: string;
  viewedAt?: string;
  item_id?: number | string;
}

export interface HistoryStats {
  items_viewed?: number;
  audio_sessions?: number;
  articles_read?: number;
}

export interface SurvivorTestimony {
  id: string;
  title: string;
  subjects?: string[];
  district?: string;
  language?: string;
  translation?: string;
  summary?: string;
  item_url?: string | string[] | null;
  listing_url?: string;
}

export interface ArtifactCollection {
  id: string;
  title: string;
  category: string;
  count: string;
  description: string;
  images: string[];
}

export interface GamificationXP {
  xp: number;
  level: number;
  currentStreak?: number;
  bestStreak?: number;
  current_streak?: number;
  best_streak?: number;
  totalDays?: number;
  total_days?: number;
}

export interface Badge {
  id: number | string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  requirement?: string;
  unlockedAt?: string | null;
  unlocked_at?: string | null;
}

export interface UserBadge extends Badge {
  unlockedAt?: string | null;
}

export interface Collectible {
  id: number | string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  rarity?: string;
  obtainedAt?: string | null;
  obtained_at?: string | null;
}

export interface UserCollectible extends Collectible {
  obtainedAt?: string | null;
}

export interface RewardFeedItem {
  id: string;
  type: 'xp' | 'levelUp' | 'badge' | 'collectible' | 'streak';
  payload?: Record<string, unknown>;
  createdAt?: string;
}

export interface IntlEvent {
  date: string;
  type: string;
  title: Record<LanguageCode, string>;
  desc: Record<LanguageCode, string>;
}
