import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function normalizeBadge(badge) {
  return { ...badge, unlockedAt: badge.unlockedAt || badge.unlocked_at || null };
}

function normalizeCollectible(collectible) {
  return { ...collectible, obtainedAt: collectible.obtainedAt || collectible.obtained_at || null };
}

export function useGamification() {
  const { user, updateUser, getToken } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [userCollectibles, setUserCollectibles] = useState([]);
  const [levels, setLevels] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = 'http://localhost:5000/api/gamification';
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchXPData = async () => {
    try {
      const response = await fetch(`${apiBase}/xp`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          updateUser({
            xp: data.data.xp,
            level: data.data.level,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching XP:', err);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch(`${apiBase}/badges`, { headers });
      if (response.ok) {
        const data = await response.json();
        setBadges((data.data || []).map(normalizeBadge));
      }
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const response = await fetch(`${apiBase}/my-badges`, { headers });
      if (response.ok) {
        const data = await response.json();
        setUserBadges((data.data || []).map(normalizeBadge));
      }
    } catch (err) {
      console.error('Error fetching user badges:', err);
    }
  };

  const fetchCollectibles = async () => {
    try {
      const response = await fetch(`${apiBase}/collectibles`, { headers });
      if (response.ok) {
        const data = await response.json();
        setCollectibles((data.data || []).map(normalizeCollectible));
      }
    } catch (err) {
      console.error('Error fetching collectibles:', err);
    }
  };

  const fetchUserCollectibles = async () => {
    try {
      const response = await fetch(`${apiBase}/my-collectibles`, { headers });
      if (response.ok) {
        const data = await response.json();
        setUserCollectibles((data.data || []).map(normalizeCollectible));
      }
    } catch (err) {
      console.error('Error fetching user collectibles:', err);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${apiBase}/levels`, { headers });
      if (response.ok) {
        const data = await response.json();
        setLevels(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${apiBase}/leaderboard`, { headers });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const awardXP = async (amount, reason) => {
    try {
      const response = await fetch(`${apiBase}/award-xp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount, reason }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.user) {
          updateUser({
            xp: data.data.user.xp,
            level: data.data.user.level,
          });
        }
        if (data.data?.newBadges?.length) {
          await fetchXPData();
          await fetchUserBadges();
        }
        return data;
      }
    } catch (err) {
      console.error('Error awarding XP:', err);
      setError(err);
    }
  };

  const trackActivity = async (activityType, itemId, metadata = {}) => {
    if (!token) return null;
    try {
      const response = await fetch(`${apiBase}/track-activity`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ activityType, itemId: String(itemId), metadata }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const result = data.data;
      if (result?.xpAwarded > 0) {
        await fetchXPData();
      }
      if (result?.newBadges?.length > 0) {
        await fetchUserBadges();
        // Push badge unlock events for toast + profile feed
        const { pushBadgeUnlock } = await import('../utils/rewardFeed.js');
        pushBadgeUnlock(result.newBadges);
      }
      return result;
    } catch (err) {
      console.error('Error tracking activity:', err);
      return null;
    }
  };

  const awardBadge = async (badgeId) => {
    try {
      const response = await fetch(`${apiBase}/award-badge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ badgeId }),
      });
      if (response.ok) {
        await fetchUserBadges();
      }
    } catch (err) {
      console.error('Error awarding badge:', err);
    }
  };

  const awardCollectible = async (collectibleId) => {
    try {
      const response = await fetch(`${apiBase}/award-collectible`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ collectibleId }),
      });
      if (response.ok) {
        await fetchUserCollectibles();
      }
    } catch (err) {
      console.error('Error awarding collectible:', err);
    }
  };

  const dailyLogin = async () => {
    try {
      const response = await fetch(`${apiBase}/daily-login`, {
        method: 'POST',
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        await fetchXPData();
        return data;
      }
    } catch (err) {
      console.error('Error with daily login:', err);
    }
  };

  const initialize = async () => {
    if (!token) return;
    setLoading(true);
    await Promise.all([
      fetchXPData(),
      fetchBadges(),
      fetchUserBadges(),
      fetchCollectibles(),
      fetchUserCollectibles(),
      fetchLevels(),
      fetchLeaderboard(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      initialize();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getCurrentLevelData = () => {
    return levels.find(l => l.level === user?.level) || levels[0];
  };

  const getNextLevelData = () => {
    return levels.find(l => l.level === (user?.level || 1) + 1);
  };

  return {
    badges,
    userBadges,
    collectibles,
    userCollectibles,
    levels,
    leaderboard,
    loading,
    error,
    awardXP,
    awardBadge,
    awardCollectible,
    dailyLogin,
    trackActivity,
    getCurrentLevelData,
    getNextLevelData,
    refresh: initialize,
  };
}
