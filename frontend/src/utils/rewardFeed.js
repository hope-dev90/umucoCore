const REWARD_FEED_KEY = 'umuco_recent_reward_feed';
const MAX_REWARD_ITEMS = 8;
const listeners = new Set();

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
