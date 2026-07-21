const REWARD_FEED_KEY = 'umuco_recent_reward_feed';
const MAX_REWARD_ITEMS = 8;
const listeners = new Set();
const badgeUnlockListeners = new Set();

export function getRewardFeed() {
  try {
    const raw = localStorage.getItem(REWARD_FEED_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function pushRewardFeedItem(item) {
  const next = [item, ...getRewardFeed()].slice(0, MAX_REWARD_ITEMS);
  localStorage.setItem(REWARD_FEED_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener(next));
}

export function subscribeRewardFeed(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Fires badge unlock toast notifications.
 * @param {Array} badges - array of badge objects with id, name, icon, xp_reward
 */
export function pushBadgeUnlock(badges) {
  if (!Array.isArray(badges) || badges.length === 0) return;
  badgeUnlockListeners.forEach((listener) => listener(badges));
  // Also push to reward feed for Profile page
  badges.forEach((badge) => {
    pushRewardFeedItem({
      id: `badge-${badge.id}-${Date.now()}`,
      type: 'badge',
      payload: { badge },
    });
  });
}

export function subscribeBadgeUnlocks(listener) {
  badgeUnlockListeners.add(listener);
  return () => badgeUnlockListeners.delete(listener);
}
