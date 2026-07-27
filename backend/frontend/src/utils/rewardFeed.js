const MAX_REWARD_ITEMS = 8;
const listeners = new Set();
const badgeUnlockListeners = new Set();

// In-memory only — no localStorage persistence
let _rewardFeed = [];

export function getRewardFeed() {
  return _rewardFeed;
}

export function pushRewardFeedItem(item) {
  _rewardFeed = [item, ..._rewardFeed].slice(0, MAX_REWARD_ITEMS);
  listeners.forEach((listener) => listener(_rewardFeed));
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
