import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { gamificationEvents, GE } from '../utils/gamificationEvents';

const GamificationContext = createContext(null);

const API = 'http://localhost:5000/api/gamification';

function getHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function normalizeBadge(badge) {
  return { ...badge, unlockedAt: badge.unlockedAt || badge.unlocked_at || null };
}

function normalizeCollectible(collectible) {
  return { ...collectible, obtainedAt: collectible.obtainedAt || collectible.obtained_at || null };
}

export function GamificationProvider({ children }) {
  const { user, updateUser } = useAuth();

  const [badges, setBadges]                   = useState([]);
  const [userBadges, setUserBadges]           = useState([]);
  const [collectibles, setCollectibles]       = useState([]);
  const [userCollectibles, setUserCollectibles] = useState([]);
  const [levels, setLevels]                   = useState([]);
  const [leaderboard, setLeaderboard]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [streak, setStreak]                   = useState(user?.currentStreak || 0);
  const [bestStreak, setBestStreak]           = useState(user?.bestStreak || 0);
  const [lastLoginDate, setLastLoginDate]     = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const markService = (ok) => setServiceAvailable(ok);

  // ── Fetch functions ───────────────────────────────────────────────────────

  const fetchXP = async () => {
    const r = await fetch(`${API}/xp`, { headers: getHeaders() });
    if (!r.ok) throw new Error('xp');
    const d = await r.json();
    if (d.data) updateUser({ xp: d.data.xp, level: d.data.level });
  };

  const fetchBadges = async () => {
    const [all, mine] = await Promise.all([
      fetch(`${API}/badges`,     { headers: getHeaders() }),
      fetch(`${API}/my-badges`,  { headers: getHeaders() }),
    ]);
    if (all.ok)  setBadges(((await all.json()).data || []).map(normalizeBadge));
    if (mine.ok) setUserBadges(((await mine.json()).data || []).map(normalizeBadge));
  };

  const fetchCollectibles = async () => {
    const [all, mine] = await Promise.all([
      fetch(`${API}/collectibles`,    { headers: getHeaders() }),
      fetch(`${API}/my-collectibles`, { headers: getHeaders() }),
    ]);
    if (all.ok)  setCollectibles(((await all.json()).data || []).map(normalizeCollectible));
    if (mine.ok) setUserCollectibles(((await mine.json()).data || []).map(normalizeCollectible));
  };

  const fetchLevels = async () => {
    const r = await fetch(`${API}/levels`, { headers: getHeaders() });
    if (r.ok) setLevels((await r.json()).data || []);
  };

  const fetchLeaderboard = async () => {
    const r = await fetch(`${API}/leaderboard`, { headers: getHeaders() });
    if (r.ok) setLeaderboard((await r.json()).data || []);
  };

  // ── Refresh (full sync) ──────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token')) { setLoading(false); return; }
    setLoading(true);
    try {
      await Promise.all([fetchXP(), fetchBadges(), fetchCollectibles(), fetchLevels(), fetchLeaderboard()]);
      markService(true);
    } catch {
      markService(false);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  // ── Daily login (once per calendar day) ─────────────────────────────────

  const runDailyLogin = useCallback(async () => {
    const today = new Date().toDateString();
    if (lastLoginDate === today) return;
    try {
      const r = await fetch(`${API}/daily-login`, { method: 'POST', headers: getHeaders() });
      if (!r.ok) return;
      const d = await r.json();
      setLastLoginDate(today);
      const newStreak    = d.data?.currentStreak ?? d.data?.streak ?? 0;
      const newBestStreak = d.data?.bestStreak ?? 0;
      setStreak(newStreak);
      setBestStreak(newBestStreak);
      updateUser({ currentStreak: newStreak, bestStreak: newBestStreak });
      const MILESTONES = [7, 14, 30];
      gamificationEvents.emit(GE.STREAK, {
        streak:    newStreak,
        milestone: MILESTONES.includes(newStreak),
        isNew:     true,
      });
      await fetchXP();
      await fetchBadges();
      markService(true);
    } catch { markService(false); }
  }, [lastLoginDate]); // eslint-disable-line

  // ── Initialize when user is available ────────────────────────────────────

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setStreak(user.currentStreak || 0);
    setBestStreak(user.bestStreak || 0);
    refresh().then(() => runDailyLogin());
  }, [user?.id]); // eslint-disable-line

  // ── Award XP ─────────────────────────────────────────────────────────────

  const awardXP = useCallback(async (amount, reason) => {
    try {
      const r = await fetch(`${API}/award-xp`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ amount, reason }),
      });
      if (!r.ok) throw new Error('award-xp');
      const d = await r.json();
      const prev = user?.level || 1;
      if (d.data?.user) {
        updateUser({ xp: d.data.user.xp, level: d.data.user.level });
        gamificationEvents.emit(GE.XP, { amount, reason, newXP: d.data.user.xp, newLevel: d.data.user.level });
        if (d.data.user.level > prev) {
          gamificationEvents.emit(GE.LEVEL_UP, { level: d.data.user.level });
        }
      }
      if (d.data?.newBadges?.length) {
        d.data.newBadges.map(normalizeBadge).forEach((badge) => {
          gamificationEvents.emit(GE.BADGE, { badge });
        });
        await fetchBadges();
        await fetchXP();
      }
      markService(true);
      return d;
    } catch {
      markService(false);
    }
  }, [user?.level]); // eslint-disable-line

  // ── Award Badge ──────────────────────────────────────────────────────────

  const awardBadge = useCallback(async (badgeId) => {
    try {
      const r = await fetch(`${API}/award-badge`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ badgeId }),
      });
      if (!r.ok) return;
      await fetchBadges();
      const badge = badges.find(b => b.id === badgeId);
      if (badge) gamificationEvents.emit(GE.BADGE, { badge });
      markService(true);
    } catch { markService(false); }
  }, [badges]); // eslint-disable-line

  // ── Award Collectible ────────────────────────────────────────────────────

  const awardCollectible = useCallback(async (collectibleId) => {
    try {
      const r = await fetch(`${API}/award-collectible`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ collectibleId }),
      });
      if (!r.ok) return;
      await fetchCollectibles();
      const col = collectibles.find(c => c.id === collectibleId);
      if (col) gamificationEvents.emit(GE.COLLECTIBLE, { collectible: col });
      markService(true);
    } catch { markService(false); }
  }, [collectibles]); // eslint-disable-line

  // ── Track Activity ────────────────────────────────────────────────────────

  const trackActivity = useCallback(async (activityType, itemId, metadata = {}) => {
    if (!localStorage.getItem('token')) return null;
    try {
      const r = await fetch(`${API}/track-activity`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ activityType, itemId: String(itemId), metadata }),
      });
      if (!r.ok) return null;
      const d = await r.json();
      const result = d.data;
      if (result?.xpAwarded > 0) {
        await fetchXP();
      }
      if (result?.newBadges?.length > 0) {
        result.newBadges.map(normalizeBadge).forEach((badge) => {
          gamificationEvents.emit(GE.BADGE, { badge });
        });
        await fetchBadges();
        await fetchXP();
        // Trigger toast notifications
        const { pushBadgeUnlock } = await import('../utils/rewardFeed.js');
        pushBadgeUnlock(result.newBadges);
      }
      markService(true);
      return result;
    } catch {
      markService(false);
      return null;
    }
  }, []); // eslint-disable-line

  const fetchUserActivityItems = useCallback(async (activityType) => {
    if (!localStorage.getItem('token')) return [];
    try {
      const r = await fetch(`${API}/activity/${activityType}/items`, {
        headers: getHeaders(),
      });
      if (!r.ok) return [];
      const d = await r.json();
      markService(true);
      return d.data || [];
    } catch {
      markService(false);
      return [];
    }
  }, []);

  const getCurrentLevelData = useCallback(() => levels.find(l => l.level === (user?.level || 1)) || levels[0], [levels, user?.level]);
  const getNextLevelData    = useCallback(() => levels.find(l => l.level === (user?.level || 1) + 1), [levels, user?.level]);

  const value = useMemo(() => ({
    xp:               user?.xp || 0,
    level:            user?.level || 1,
    streak,
    bestStreak,
    badges,
    userBadges,
    collectibles,
    userCollectibles,
    leaderboard,
    levels,
    loading,
    serviceAvailable,
    refresh,
    awardXP,
    awardBadge,
    awardCollectible,
    trackActivity,
    fetchUserActivityItems,
    getCurrentLevelData,
    getNextLevelData,
  }), [user?.xp, user?.level, streak, bestStreak, badges, userBadges, collectibles, userCollectibles, leaderboard, levels, loading, serviceAvailable, refresh, awardXP, awardBadge, awardCollectible, trackActivity, fetchUserActivityItems, getCurrentLevelData, getNextLevelData]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamificationContext must be used within GamificationProvider');
  return ctx;
}

export default GamificationContext;
