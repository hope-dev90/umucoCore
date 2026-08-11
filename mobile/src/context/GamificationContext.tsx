import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  awardXP as awardXPApi,
  dailyLogin as dailyLoginApi,
  fetchLevels,
  fetchXP,
  trackActivity as trackActivityApi,
  type AwardXPResult,
  type DailyLoginResult,
} from '../services/gamificationService';
import { useAuth } from './AuthContext';
import type { Badge, GamificationXP } from '../types';

export type RewardToast =
  | { id: string; type: 'xp'; amount: number; reason?: string; newXP?: number; newLevel?: number }
  | { id: string; type: 'levelUp'; level: number }
  | { id: string; type: 'badge'; badge: Badge }
  | { id: string; type: 'streak'; streak: number; isNew?: boolean };

interface GamificationContextValue {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  nextLevelXP: number;
  toasts: RewardToast[];
  dismissToast: (id: string) => void;
  refreshXP: () => Promise<void>;
  awardXP: (amount: number, reason?: string) => Promise<AwardXPResult | null>;
  dailyLogin: () => Promise<DailyLoginResult | null>;
  trackActivity: (activityType: string, itemId?: string | number) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [xp, setXp] = useState(user?.xp || 0);
  const [level, setLevel] = useState(user?.level || 1);
  const [streak, setStreak] = useState(user?.currentStreak || 0);
  const [bestStreak, setBestStreak] = useState(user?.bestStreak || 0);
  const [nextLevelXP, setNextLevelXP] = useState(user?.xpToNextLevel || 100);
  const [toasts, setToasts] = useState<RewardToast[]>([]);
  const awardedReasons = useRef(new Set<string>());

  const pushToast = useCallback((toast: RewardToast | Omit<RewardToast, 'id'>) => {
    const item = { ...toast, id: 'id' in toast && toast.id ? toast.id : uid() } as RewardToast;
    setToasts((prev) => [...prev, item].slice(-5));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const applyXP = useCallback((data: GamificationXP | null) => {
    if (!data) return;
    setXp(data.xp ?? 0);
    setLevel(data.level ?? 1);
    setStreak(data.currentStreak ?? data.current_streak ?? 0);
    setBestStreak(data.bestStreak ?? data.best_streak ?? 0);
  }, []);

  const refreshXP = useCallback(async () => {
    const [xpData, levels] = await Promise.all([fetchXP(), fetchLevels()]);
    applyXP(xpData);
    if (levels.length) {
      const current = xpData?.level ?? level;
      const next = levels.find((l) => l.level === current + 1) || levels.find((l) => l.level > current);
      if (next?.requiredXP) setNextLevelXP(next.requiredXP);
    }
  }, [applyXP, level]);

  useEffect(() => {
    if (!user) return;
    refreshXP();
    (async () => {
      const result = await dailyLoginApi();
      if (result) {
        const s = result.currentStreak ?? result.streak ?? 0;
        setStreak(s);
        if (result.bestStreak) setBestStreak(result.bestStreak);
        if (result.isNew) {
          pushToast({ type: 'streak', streak: s, isNew: true });
        }
      }
    })();
  }, [user?.id]);

  const awardXP = useCallback(
    async (amount: number, reason?: string) => {
      if (reason) {
        const key = `${reason}`;
        if (awardedReasons.current.has(key)) return null;
        awardedReasons.current.add(key);
      }
      const prevLevel = level;
      const result = await awardXPApi(amount, reason);
      const newXP = result?.user?.xp ?? result?.xp ?? xp + amount;
      const newLevel = result?.user?.level ?? result?.level ?? level;
      setXp(newXP);
      setLevel(newLevel);
      pushToast({ type: 'xp', amount, reason, newXP, newLevel });
      if (newLevel > prevLevel) {
        pushToast({ type: 'levelUp', level: newLevel });
      }
      (result?.newBadges || []).forEach((badge) => pushToast({ type: 'badge', badge }));
      return result;
    },
    [level, xp, pushToast]
  );

  const dailyLogin = useCallback(async () => {
    const result = await dailyLoginApi();
    if (result) {
      const s = result.currentStreak ?? result.streak ?? streak;
      setStreak(s);
      if (result.isNew) pushToast({ type: 'streak', streak: s, isNew: true });
    }
    return result;
  }, [pushToast, streak]);

  const trackActivity = useCallback(async (activityType: string, itemId?: string | number) => {
    await trackActivityApi(activityType, itemId);
  }, []);

  const value = useMemo(
    () => ({
      xp,
      level,
      streak,
      bestStreak,
      nextLevelXP,
      toasts,
      dismissToast,
      refreshXP,
      awardXP,
      dailyLogin,
      trackActivity,
    }),
    [
      xp,
      level,
      streak,
      bestStreak,
      nextLevelXP,
      toasts,
      dismissToast,
      refreshXP,
      awardXP,
      dailyLogin,
      trackActivity,
    ]
  );

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
